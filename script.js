const output = document.getElementById('output'); //grab main txt output container from HTML, where command results and responses are dynamically printed
const userInput = document.getElementById('user-input'); //grabs text input field
const terminal = document.getElementById('terminal'); //grabs primary wrapper element / terminal
let inDoctorMode = false; //state flag used to track doctor mode

// escapesHTML special characters so user-typed or fetched text can never be interpreted as markup/scripts when injected via innerHTML.
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;') //& becomes &amp
        .replace(/</g, '&lt;') //< becomes &lt
        .replace(/>/g, '&gt;') //> becomes &gt
        .replace(/"/g, '&quot;') //" becomes *quot
        .replace(/'/g, '&#039;'); //' becomes &#039
}

output.innerHTML = "Welcome to tbomb98's Web Terminal v1.0\nType 'help' to see available commands.\n\n"; //welcome message :D

userInput.addEventListener('keydown', function(event) {//listens for keyboard input on terminal text box
    if (event.key === 'Enter') {
        const command = userInput.value.trim();
        
        //print command to history
        output.innerHTML += `guest@terminal:~$ ${escapeHtml(command)}\n`;
        
        //process command
        handleCommand(command);
        
        //clear input and scroll to bottom
        userInput.value = '';
        terminal.scrollTop = terminal.scrollHeight;
    }
});

function handleCommand(cmd) {
    const lowerCmd = cmd.toLowerCase();

    //if the user is currently talking to the doctor
    if (inDoctorMode) {
        if (lowerCmd === 'exit' || lowerCmd === 'quit') {
            inDoctorMode = false;
            output.innerHTML += "Doctor: Goodbye. I hope our session was helpful.\n\n";
            return;
        }
        
        //generate a therapeutic response
        const response = getDoctorResponse(cmd);
        output.innerHTML += `Doctor: ${escapeHtml(response)}\n\n`;
        return;
    }

    //check if the user wants to start the doctor session
    if (lowerCmd === 'doctor') {
        inDoctorMode = true;
        output.innerHTML += "Doctor: Hello. How are you feeling today? (Type 'exit' to end session)\n\n";
        return;
    }

    //check if the command starts with 'echo '
    if (lowerCmd.startsWith('echo ')) {
        const echoText = cmd.slice(5); // preserve original casing/spacing after "echo "
        output.innerHTML += `${escapeHtml(echoText)}\n\n`;
        return;
    }
    if (lowerCmd === 'echo') {
        output.innerHTML += "\n\n";
        return;
    }

    //check if the command starts with 'read ' or 'cat '
    if (lowerCmd.startsWith('read ') || lowerCmd.startsWith('cat ')) {
        const fileName = cmd.split(' ')[1];
        
        if (!fileName) {
            output.innerHTML += "Error: Please specify a file name (e.g., 'read about.txt')\n\n";
            return;
        }

        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error("File not found");
                }
                return response.text();
            })
            .then(fileContent => {
                output.innerHTML += `${escapeHtml(fileContent)}\n\n`;
                terminal.scrollTop = terminal.scrollHeight;
            })
            .catch(error => {
                output.innerHTML += `cat: ${fileName}: No such file or directory\n\n`;
                terminal.scrollTop = terminal.scrollHeight;
            });
        return;
    }

    switch(lowerCmd) { // handles rest of built in single word commands
        case 'help': // help command
            output.innerHTML += "Available commands:\n" +
                "  help       - Shows this help menu\n" +
                "  doom       - Play DOOM (1993) directly from the shell\n" +
                "  clear      - Clears the terminal screen\n" +
                "  about      - Displays info about this terminal\n" +
                "  whoami     - Displays current active user\n" +
                "  ls         - Lists available text files\n" +
                "  read [file]- Reads a text file (e.g., 'read about.txt')\n" +
                "  echo       - Prints text back to the screen (e.g., 'echo hello')\n" +
                "  matrix     - Enter the matrix\n" +
                "  doctor     - Talk to the built-in virtual therapist\n" +
                "  date       - Shows current date and time\n\n";
            break;
        case 'clear': // clear command
            output.innerHTML = '';
            break;
        case 'whoami': //tells you who you are
            output.innerHTML += "guest\n\n";
            break;
        case 'ls': //fetch files.json using fetch then print list of file names
            fetch('files.json')
                .then(response => {
                    if (!response.ok) throw new Error("Could not load file list");
                    return response.json();
                })
                .then(fileList => {
                    output.innerHTML += fileList.join("   ") + "\n\n";
                    terminal.scrollTop = terminal.scrollHeight;
                })
                .catch(error => { //if fail about.txt
                    output.innerHTML += "about.txt\n\n";
                    terminal.scrollTop = terminal.scrollHeight;
                });
            break;
        case 'matrix': //matrix work in progress
            output.innerHTML += "Wake up, Neo...\nThe Matrix has you...\nFollow the white rabbit.\n\n";
            break;
        case 'about': //about command smaller text compared to about.txt
            output.innerHTML += "This is a custom interactive browser terminal built with HTML, CSS, and JS.\n\n";
            break;
        case 'date': //tell date
            output.innerHTML += `${new Date().toString()}\n\n`;
            break;
        case '':
            break;
        case 'doom': //doom
            output.innerHTML += "Launching DOOM...\n\n";
            launchDoom();
            break;
        default: //catch unrecongnised input and returns an error
            output.innerHTML += `Command not found: ${escapeHtml(cmd)}. Type 'help' for a list of commands.\n\n`;
    }
}

let doomStarted = false; //tracking flag for doom
//grab ref to the container wrapper
const dosboxContainer = document.getElementById('dosbox-container'); 
const dosboxCanvas = document.getElementById('dosbox');
const dosboxClose = document.getElementById('dosbox-close');
 
function launchDoom() {//doom function
    dosboxContainer.style.display = 'block'; //unhides DOS emulator
    dosboxCanvas.focus();
    userInput.blur(); //let the canvas receive keyboard input instead of the terminal field
 
    if (doomStarted) {
        return; //already loaded, just show it again
    }
    doomStarted = true;
 
    Dos(dosboxCanvas, {
        wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js"
    }).ready((fs, main) => {
        fs.extract("https://js-dos.com/cdn/upload/DOOM-@evilution.zip").then(() => {
            main(["-c", "cd DOOM", "-c", "DOOM.EXE"]);
        });
    }).catch((message) => {
        output.innerHTML += `Error launching DOOM: ${escapeHtml(String(message))}\n\n`;
        terminal.scrollTop = terminal.scrollHeight;
    });
}
 
dosboxClose.addEventListener('click', () => { //closing doom
    dosboxContainer.style.display = 'none';
    userInput.focus();
});
 
function getDoctorResponse(userInput) { //doctor command
    const text = userInput.toLowerCase();
    
    if (text.includes('sad') || text.includes('depressed') || text.includes('unhappy')) {
        return "I am sorry to hear that you are feeling down. Can you tell me more about what is making you feel this way?";
    }
    if (text.includes('mother') || text.includes('father') || text.includes('family')) {
        return "Tell me more about your family dynamics.";
    }
    if (text.includes('computer') || text.includes('code') || text.includes('terminal')) {
        return "Do you find talking to technology easier than talking to people?";
    }
    if (text.includes('i feel')) {
        return `Why do you feel that ${userInput.slice(7)}?`;
    }
    if (text.includes('i am') || text.includes("i'm")) {
        return `How long have you been ${userInput.split(' ')[1] || 'like this'}?`;
    }
    
    // default fallback reflections
    const fallbacks = [
        "Please go on.",
        "That is quite interesting. Tell me more.",
        "How does that make you feel?",
        "Why do you say that?",
        "Let's explore that thought a bit further."
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}