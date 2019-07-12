# Nand2Tetris - Compiler

This is a compiler which compiles code written in the hack assembly language to binary instructions which can be interpreted by the HACK PC.

The task to build this compiler was the final programming challenge in the first part of the nand2tetris course.

The compiler is completely dependency free (ok... chalk does not count :D ). Furthermore I've converted the compiler into a CLI-app.

### Usage
* clone the repository
* navigate into the folder via the terminal
* type  ``chmod +x ./compiler.js`` and press enter
* now you can convert any ``.asm`` files into binary code

    ```./compiler.js path/to/assembly_code.asm path/to/destination/of/{{filename}}.hack```