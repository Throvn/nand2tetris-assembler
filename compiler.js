#!/usr/bin/env node
const process = require('process')
const fs = require('fs')
const chalk = require('chalk')
console.log(chalk.bold("               ==== Hack Compiler ===="))
if (process.argv.length < 4) {
    console.log("You have not provided enough arguments...\nPlease structure your command like the following example:")
    console.log("\n"+chalk.bold("./compiler.js ")+chalk.bold.cyan("path/to/assembly_code.asm ")+chalk.bold.yellow("path/to/destination/of/"+chalk.italic("{{fileame}}")+".hack"))
    console.log("\nRelative paths are also possible")
    process.exit()
}
console.log("Retriving "+chalk.underline("Assembly Code")+" from: " + chalk.blue(process.argv[2]))
console.log("Saving "+chalk.underline("Binary Code")+" to:        "+ chalk.yellow(process.argv[3]+ ".hack\n"))

const fileName = process.argv[2]

function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

let instructions = [], zeros = '000000000000000'
let lineCount = 0, linesIgnored = 0

let mem = 17, vars = {}

var lines = require('fs').readFileSync(fileName, 'utf-8')
    .split(/\n|\r/g)
    .filter(Boolean);

lines.forEach((line, index) => {
    lineCount++
    line = line.split(" ").join("")
    if (line.startsWith('//') || line === "") {linesIgnored++; return}
    else if (line.includes('//')) line = line.split("//")[0];

    if (line.search(/\((.*?)\)/) >= 0) {
        let varname = line.match(/\((.*?)\)/)[1]
        linesIgnored++
        vars[varname] = lineCount - linesIgnored
    }
    if (line.search(/\@R1[0-6]|\@R[0-9]|\@(\d)+/) < 0 && line.includes('@')) {
        let varname = line.substr(1)
        switch (varname) {
            case "SP":
            case "LCL":
            case "ARG":
            case "THIS":
            case "THAT":
            case "SCREEN":
            case "KBD":
                break;
            default:
                if(!vars[varname]) {
                    vars[varname] = mem
                    mem++
                }
                break;
        }
    }
})


console.log("Variables (+ memory location): ", vars)

wait(10)
lines.forEach((line, index) => {
    line = line.split(" ").join("")

    if (line.startsWith('//') || line === "") return;
    else if (line.includes('//')) line = line.split("//")[0];
    else if (line.search(/\((.*?)\)/) >= 0) return;

    if (line[0] === '@') {
        //a instruction
        if(line.search(/\@R1[0-6]|\@R[0-9]/) >= 0) line = line.replace("@R", "");
        
        let binary = (parseInt(line.substr(1))).toString(2)

        if (isNaN(binary)) {
            const name = line.substr(1)
            switch (name) {
                case "SP":
                    binary = 0
                    break;
                case "LCL":
                    binary = 1
                    break;
                case "ARG":
                    binary = 10
                    break;
                case "THIS":
                    binary = 11
                    break;
                case "THAT":
                    binary = 100
                    break;
                case "SCREEN":
                    binary = (16384).toString(2)
                    break;
                case "KBD":
                    binary = (24576).toString(2)
                    break;
                default:
                    binary = parseInt(vars[name]).toString(2)
                    break;
            }
            binary = '0' + zeros.substr(binary.length) + binary
        } else {
            binary = '0' + zeros.substr(binary.length) + binary
        };
        instructions.push(binary)
        //console.log(chalk.bold(binary))
        //return
    } else {
        // else c instruction
        line = line.split("=")
        let inst
        if (line.length === 2) {
            inst = {d:line[0], c: line[1]};
            line = line[1].split(";")
            if (line[1]) inst = {d:line[0], c: line[1][0], j: line[1][1]};
        } else {
            line = line[0].split(";")
            if (line[0]) inst = {c: line[0], j: line[1]};
        }
        let a = '0', d1 = '0', d2 = '0', d3 = '0', c1 = '0', c2 = '0', c3 = '0', c4 = '0', c5 = '0', c6 = '0', jump = '000'

        
        if (inst.d) {
            inst.d.split("").forEach(destination => {
                switch (destination) {
                    case 'A':
                        d1 = '1'
                        break;
                    case 'D':
                        d2 = '1'
                        break;
                    case 'M':
                        d3 = '1'
                        break;
                    default:

                        break;
                }
            })
        }
        if (inst.c) {
            if (inst.c.includes('M')) a = '1';
            switch (inst.c.length) {
                case 1:
                    if(inst.c === '0') {
                        c1 = '1', c3 = '1', c5 = '1'
                    } else if(inst.c === '1') {
                        c1 = '1', c2 = '1', c3 = '1', c4 = '1', c5 = '1', c6 = '1'
                    } else if(inst.c === 'D') {
                        c3 = '1', c4= '1'
                    } else if (inst.c === 'A' || inst.c === 'M') {
                        c1 = '1', c2 = '1'
                    } else {
                        console.log(chalk.bold.red(index+": The Character you used is not allowed"))
                        console.log(line)
                    }
                    break;
                case 2:
                    if (inst.c === "-1") {
                        c1 = '1', c2 = '1', c3 = '1', c5 = '1'
                    } else if (inst.c === "!D") {
                        c3 = '1', c4 = '1', c6 = '1'
                    } else if (inst.c === "!A" || inst.c === "!M") {
                        c1 = '1', c2 = '1', c6 = '1'
                    } else if (inst.c === "-D") {
                        c3 = '1', c4 = '1', c5 = '1', c6 = '1'
                    } else if (inst.c === "-A" || inst.c === "-M") {
                        c1 = '1', c2 = '1', c5 = '1', c6 = '1'
                    }
                    break;
                case 3:
                    if (inst.c === "D+1") {
                        c2 = '1', c3 = '1', c4 = '1', c5 = '1', c6 = '1'
                    } else if (inst.c === "A+1" || inst.c === "M+1") {
                        c1 = '1', c2 = '1', c4 = '1', c5 = '1', c6 = '1'
                    } else if (inst.c === "D-1") {
                        c3 = '1', c4 = '1', c5 = '1'
                    } else if (inst.c === "A-1" || inst.c === "M-1") {
                        c1 = '1', c2 = '1', c5 = '1'
                    } else if (inst.c === "D+A" || inst.c === "D+M") {
                        c5 = '1'
                    } else if (inst.c === "D-A" || inst.c === "D-M") {
                        c2 = '1', c5 = '1', c6 = '1'
                    } else if (inst.c === "A-D" || inst.c === "M-D") {
                        c4 = '1', c5 = '1', c6 = '1'
                    } else if (inst.c.includes('|')) {
                        c2 = '1', c4 = '1', c6 = '1'
                    }
                    break;
                default:
                    console.log(chalk.bold.red(lineCount+": Your instruction is too long... "+inst.c))
                    break;
            }
        }
        if(inst.j) {
            switch (inst.j) {
                case 'JGT':
                    jump = '001'
                    break;
                case 'JEQ':
                    jump = '010'
                    break;
                case 'JGE':
                    jump = '011'
                    break;
                case 'JLT':
                    jump = '100'
                    break;
                case 'JNE':
                    jump = '101'
                    break;
                case 'JLE':
                    jump = '110'
                    break;
                case 'JMP':
                    jump = '111'
                    break;
                default:
                    break;
            }
        }
        instructions.push('111' + a + c1 + c2 + c3 + c4 + c5 + c6 + d1 + d2 + d3 + jump)
    }
})

console.log(instructions)
let res = ""
instructions.forEach(line => {
    res = res + line + "\n"
})

fs.appendFile(process.argv[3]+'.hack', res, (err) => {
    //callback to silence warnings
})
console.log(chalk.bold.green("✔ Done"))