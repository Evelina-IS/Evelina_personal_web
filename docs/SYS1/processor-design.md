# Lec07-2 (2) — The Processor: Design

**System I Li Lu — Zhejiang University**

---

## Overview

- Instruction execution in RISC-V
- Datapath
- Controller

---

## RISC-V Fields (Format)

- **opcode**: basic operation of the instruction.
- **rs1**: the first register source operand.
- **rs2**: the second register source operand.
- **rd**: the register destination operand.
- **funct**: function, this field selects the specific variant of the operation in the op field.
- **Imm**: address or immediate

---

## RISC-V Operands

| Name | Example | Comments |
|------|---------|----------|
| 32 registers (x0–x31) | x0–x31 | Fast locations for data. In RISC-V, data must be in registers to perform arithmetic. Register x0 always equals 0. |
| 2⁶¹ memory words | Memory[0], Memory[8], …, Memory[18446744073709551608] | Accessed only by data transfer instructions. RISC-V uses byte addresses, so sequential doubleword accesses differ by 8. Memory holds data structures, arrays, and spilled registers. |

---

## RISC-V Register Conventions

| Name | Register Name | Usage | Preserved on Call? |
|------|--------------|-------|-------------------|
| x0 | 0 | The constant value 0 | n.a. |
| x1 | (ra) | Return address (link register) | yes |
| x2 | (sp) | Stack pointer | yes |
| x3 | (gp) | Global pointer | yes |
| x4 | (tp) | Thread pointer | yes |
| x5–x7 | 5–7 | Temporaries | no |
| x8–x9 | 8–9 | Saved | yes |
| x10–x17 | 10–17 | Arguments/results | no |
| x18–x27 | 18–27 | Saved | yes |
| x28–x31 | 28–31 | Temporaries | no |

---

## RISC-V Assembly Language

| Category | Instruction | Example | Meaning | Comments |
|----------|-------------|---------|---------|----------|
| Arithmetic | add | `add x5, x6, x7` | x5 = x6 + x7 | Add two source register operands |
| | subtract | `sub x5, x6, x7` | x5 = x6 - x7 | First source register subtracts second one |
| | add immediate | `addi x5, x6, 20` | x5 = x6 + 20 | Used to add constants |
| Data transfer | load doubleword | `ld x5, 40(x6)` | x5 = Memory[x6+40] | doubleword from memory to register |
| | store doubleword | `sd x5, 40(x6)` | Memory[x6+40] = x5 | doubleword from register to memory |
| Logical | and | `and x5, x6, 3` | x5 = x6 & 3 | Arithmetic shift right by register |
| | inclusive or | `or x5, x6, x7` | x5 = x6 \| x7 | Bit-by-bit OR |
| Conditional Branch | branch if equal | `beq x5, x6, 100` | if (x5 == x6) go to PC+100 | PC-relative branch if registers equal |
| | branch if not equal | `bne x5, x6, 100` | if (x5 != x6) go to PC+100 | PC-relative branch if registers not equal |
| Unconditional Branch | jump and link | `jal x1, 100` | x1 = PC + 4; go to PC+100 | PC-relative procedure call |
| | jump and link register | `jalr x1, 100(x5)` | x1 = PC + 4; go to x5+100 | procedure return; indirect call |

---

## Instruction Execution in RISC-V

**Fetch:**
- Take instructions from the instruction memory
- Modify PC to point the next instruction

**Instruction decoding & Read Operand:**
- Will be translated into machine control command
- Reading Register Operands, whether or not to use

**Executive Control:**
- Control the implementation of the corresponding ALU operation

**Memory access:**
- Write or Read data from memory
- Only ld/sd

**Write results to register:**
- If it is R-type instructions, ALU results are written to rd
- If it is I-type instructions, memory data are written to rd

**Modify PC for branch instructions**

---

## Instruction Fetching Unit

Three elements of instruction fetching:

```
┌──────┐     ┌──────────────┐     ┌───────────┐
│  PC  │────▶│ Instruction  │────▶│Instruction │
│      │     │   Memory     │     │ Register  │
└──┬───┘     └──────────────┘     └───────────┘
   │
   ▼
  ADD (PC+4)
```

**Why PC+4?** — How simple it is!

Where is the sequential logic? → PC + 4 on the CPU clock cycle.

---

## Instruction Decoding

R-Type instruction fields:

```
op(7) | rd(5) | func3 | rs1(5) | rs2(5) | func7
```

- **Instruction** → Operands, Control Signal, Access Address
- Why separate them in decoding? — Different instruction types have different formats.

---

## Datapath: Building Paths with Multiplexers

- R-type instruction Datapath
- I-type instruction Datapath
  - For ALU
  - For load
- S-type (store) instruction Datapath
- B-type (branch) instruction Datapath
- J-type instruction Datapath
  - For Jump

### Instruction Format Revisit

| Format | Layout |
|--------|--------|
| R | func7 \| rs2 \| rs1 \| func3 \| rd \| opcode |
| I | imm[11:0] \| rs1 \| func3 \| rd \| opcode |
| S | imm[11:5] \| rs2 \| rs1 \| func3 \| imm[4:0] \| opcode |
| B | imm[12\|10:5] \| rs2 \| rs1 \| func3 \| imm[4:1\|11] \| opcode |
| J | imm[20\|10:1\|11\|19:12] \| rd \| opcode |

---

### R-type Instruction & Data Stream

Example: `add x9, x20, x21`

1. Read two register operands
2. Perform arithmetic/logical operation
3. Write register result

**Datapath flow:**
- Registers (Read reg1 ← rs1, Read reg2 ← rs2) → Read data 1, Read data 2
- ALU (operation controlled by ALUop) → ALU result
- ALU result → Write data → Registers (Write reg ← rd)
- RegWrite = 1, ALUSrc = 0, MemtoReg = 0

---

### I-type (Load) Instruction & Data Stream

Example: `ld x1, 200(x2)`

1. Read register operands
2. Calculate address using 12-bit offset (Use ALU, but sign-extend offset)
3. Read memory and update register

**Datapath flow (for ld):**
- ALUSrc = 1 (immediate), MemtoReg = 1 (memory → register)
- Imm Gen → sign-extended immediate → ALU input
- ALU computes address → Data Memory (Read)
- Read data → Mux (MemtoReg=1) → Write data → Registers
- MemRead = 1, RegWrite = 1

> For `addi x1, x2, 4`: same path but **no** memory access, ALU result goes directly to register.

---

### S-type (Store) Instruction & Data Stream

Example: `sd x1, 200(x2)`

1. Read register operands
2. Calculate address using 12-bit offset (Use ALU, but sign-extend offset)
3. Write register value to memory

**Datapath flow:**
- Registers → Read data 2 → Write data input of Data Memory
- ALU computes address
- MemWrite = 1, RegWrite = 0

---

### B-type (Branch) Instruction & Data Stream

Example: `beq x1, x2, 200`

1. Read register operands
2. Compare operands — Use ALU, subtract and check Zero output
3. Calculate target address:
   - Sign-extend displacement
   - Shift left 1 place (halfword displacement)
   - Add to PC value

**Datapath flow:**
- ALU does subtraction, Zero flag determines branch
- Branch target: PC + (imm << 1)
- PCSrc = (Branch AND Zero)

---

### J-type (Jump) Instruction & Data Stream

Example: `jal x1, procedure`

1. Write PC+4 to rd
2. Calculate target address:
   - Sign-extend displacement
   - Shift left 1 place (halfword displacement)
   - Add to PC value and update PC

**Datapath flow:**
- Jump target: PC + (imm << 1)
- PC+4 → Write data → Registers (link)
- Jump = 1, RegWrite = 1

---

## Composing the Elements

- First-cut data path does an instruction in **one clock cycle**
  - Each datapath element can only do one function at a time
  - Hence, we need separate instruction and data memories
- Use **multiplexers** where alternate data sources are used for different instructions

---

## Full Datapath (Overview)

Key components:

| Component | Role |
|-----------|------|
| PC | Program Counter |
| Instruction Memory | Holds program instructions |
| Registers | Register File (read/write) |
| ALU | Arithmetic/Logic operations |
| Data Memory | Load/Store data |
| Imm Gen | Immediate generation (sign-extend) |
| MUXs | Data path selection (ALUSrc, MemtoReg, PCSrc, Jump) |
| ADD | PC+4 and branch/jump target computation |

### Full Datapath Signal Settings by Instruction Type

| Signal | R-type | I-ld | S-sd | B-beq | J-jal |
|--------|--------|------|------|-------|-------|
| ALUSrc | 0 | 1 | 1 | 0 | x |
| MemtoReg | 0 | 1 | x | x | x |
| RegWrite | 1 | 1 | 0 | 0 | 1 |
| MemRead | 0 | 1 | 0 | 0 | 0 |
| MemWrite | 0 | 0 | 1 | 0 | 0 |
| Branch | 0 | 0 | 0 | 1 | x |
| Jump | 0 | 0 | 0 | 0 | 1 |
| ALU operation | add (=10) | add (=10) | add (=10) | sub (=10) | x |

---

## Combinational vs. Sequential Logic Circuit

Legend:
- **Seq** = Sequential logic (clocked)
- **Comb** = Combinational logic
- **NotUsed** = Not used in this instruction type

### R-Type Timing
```
clk → PC Update → Load Inst (ROM) → RegFile Update
      (Seq)        (Comb)            (Seq)
```

### I-ld Timing
```
clk → PC Update → Load Inst → Load Data (RAM) → RegFile Update
      (Seq)        (Comb)      (Comb+Seq)        (Seq)
```

### S-sd Timing
```
clk → PC Update → Load Inst → Write Data (RAM)
      (Seq)        (Comb)      (Seq)
```

### B-beq Timing
```
clk → PC Update (potentially to branch target)
      (Seq)
```

### J-jal Timing
```
clk → PC Update → Load Inst → RegFile Update (with PC+4 link)
      (Seq)        (Comb)      (Seq, MUX Jump selects Jump target)
```

---

## Controller Design

### Control Signals

| Signal | Effect when deasserted (0) | Effect when asserted (1) |
|--------|---------------------------|--------------------------|
| **RegWrite** | — | Register destination input is written with the value on the Write data input |
| **ALUSrc** | The second ALU operand comes from the second register file output (Read data 2) | The second ALU operand is the sign-extended lower 16 bits of the instruction |
| **PCSrc** | The PC is replaced by the output of the adder that computes the value PC+4 | The PC is replaced by the output of the adder that computes the branch target |
| **MemRead** | — | Data memory contents designated by the address input are put on the Read data output |
| **MemWrite** | — | Data memory contents designated by the address input are replaced by value on the Write data input |
| **MemtoReg** | The value fed to register Write data input comes from the ALU | The value fed to the register Write data input comes from the data memory |

### Control Signal Summary Table

| Instruction | RegWrite | ALUSrc | PCSrc | MemRead | MemWrite | MemtoReg |
|-------------|----------|--------|-------|---------|----------|----------|
| R | 1 | 0 | 0 | 0 | 0 | 0 |
| ld | 1 | 1 | 0 | 1 | 0 | 1 |
| sd | 0 | 1 | 0 | 0 | 1 | x |
| beq | 0 | 0 | 1 (if taken) | 0 | 0 | x |

---

## Building the Controller

Analyses for cause and effect — information comes from the 32 bits of the instruction:

1. **Selecting the operations** to perform by sequential components (read/write, etc.)
2. **Controlling the flow of instruction** (multiplexor inputs)
3. **Controlling the flow of data** (multiplexor inputs)
4. **ALU's operation** based on instruction type and function code

---

## Scheme of Controller — 2-Level Decoder

```
                       ┌───────────────┐
opcode (7) ───────────▶│  Main Decoder │──────────▶ Control Signals (7)
                       │   (1st Level) │
                       └───────┬───────┘
                               │ ALUop (2)
                               ▼
                       ┌───────────────┐
funct(7) + funct(3) ──▶│  ALU Decoder  │──────────▶ ALU operation (4)
                       │  (2nd Level)  │
                       └───────────────┘
```

---

## What Should the ALU Do?

| ALU Use Case | Function |
|--------------|----------|
| Load/Store | F = add |
| Branch | F = subtract |
| R-type | F depends on funct |

### ALU Control Truth Table

| opcode | ALUOp | Operation | Funct7 | Funct3 | ALU function | ALU control |
|--------|-------|-----------|--------|--------|-------------|-------------|
| ld | 00 | load register | XXXXXXX | xxx | add | 0010 |
| sd | 00 | store register | XXXXXXX | xxx | add | 0010 |
| beq | 01 | branch on equal | XXXXXXX | xxx | subtract | 0110 |
| R-type | 10 | add | 0000000 | 000 | add | 0010 |
| R-type | 10 | subtract | 0100000 | 000 | subtract | 0110 |
| R-type | 10 | AND | 0000000 | 111 | AND | 0000 |
| R-type | 10 | OR | 0000000 | 110 | OR | 0001 |

ALU Operations:
- 0000 = And
- 0001 = Or
- 0010 = Add
- 0110 = Subtract

---

## Designing the Main Control Unit — First Level

Main Control Unit function:
- ALUop (2 bits)
- Divided 7 control signals into 2 groups:
  - **4 Mux** controls: ALUSrc, Branch, MemtoReg, Jump
  - **3 R/W** controls: MemRead, MemWrite, RegWrite

### Truth Table for Main Decoder

| Instruction | Opcode | ALUSrc | MemtoReg | RegWrite | MemRead | MemWrite | Branch | Jump | ALUOp1 | ALUOp0 |
|-------------|--------|--------|----------|----------|---------|----------|--------|------|--------|--------|
| R-format | 0110011 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| Ld | 0000011 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| Sd | 0100011 | 1 | x | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| beq | 1100111 | 0 | x | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| Jal | 1101111 | x | x | 1 | 0 | 0 | x | 1 | x | x |

### Deriving Control Signals from Opcode (Example)

```
MemRead = ~Op[6] & ~Op[5] & ~Op[4] & ~Op[3] & ~Op[2] & Op[1] & Op[0]
```

---

## Designing the ALU Decoder — Second Level

ALU operation is decided by:
- 2-bit ALUOp derived from opcode
- funct7 & funct3 fields of the instruction
- Combinational logic derives ALU control

---

## Per-Instruction Controller Walkthrough

### R Instruction — `add x9, x20, x21`
1. Read two register operands (rs1, rs2)
2. Perform arithmetic/logical operation (ALU: add)
3. Write register result (rd)
- Control: jump=0, ALUSrc=0, MemtoReg=0, RegWrite=1

### Load Instruction — `lw x1, 200(x2)`
1. Read register operands (rs1)
2. Calculate address using 12-bit offset (ALU: add with sign-extended imm)
3. Read memory and update register
- Control: jump=0, ALUSrc=1, MemtoReg=1, RegWrite=1, MemRead=1

### Store Instruction — `sw x1, 200(x2)`
1. Read register operands (rs1, rs2)
2. Calculate address using 12-bit offset (ALU: add with sign-extended imm)
3. Write register value to memory
- Control: jump=0, ALUSrc=1, MemWrite=1

### Beq Instruction — `beq x1, x2, 200`
- Read register operands
- Compare operands (ALU: subtract, check Zero output)
- Calculate target address: sign-extend displacement, shift left 1, add to PC
- Control: Branch=1 (if Zero), PCSrc selects branch target

### Jal Instruction — `jal x1, procedure`
- Write PC+4 to rd (link)
- Calculate target address: sign-extend displacement, shift left 1, add to PC
- Control: Jump=1, RegWrite=1, PCSrc selects jump target

---

## Control Structure

- All of the logic is **combinational**
- We wait for everything to settle down, and the right thing to be done
  - ALU might not produce right answer right away theoretically
  - We use write signals along with clock to determine when to write
- **Cycle time** determined by length of the longest path

```
Instruction n ──▶ Datapath/Memory/Controller ──▶ Instruction n+1
                 (Invoke next instruction under the clock)
```

We are ignoring some details like setup and hold times.

---

## Time Flow — R-Type

### Combinational vs. Sequential

1. **Old value** → PC, registers
2. rs1, rs2, rd, op, funct propagate
3. ALU control generated
4. RegWrite asserted
5. Read data 1 & read data 2 available
6. ALU computes → **New value** written to register

```
         Old value          New value
clk     ───────┘         └────────────────
PC      ───────┘         └────────────────
Rs1,Rs2 ───────┘         └────────────────
ALUctr  ──────────────────┘         └────
RegWr   ──────────────────┘         └────
Rd1,Rd2 ───────────────────────────┘  └──
WrData  ──────────────────────────────────┘
```

---

## Single Cycle Implementation — Performance for lw

Calculate cycle time assuming negligible delays except:
- Memory: **200 ps**
- ALU and adders: **200 ps**
- Register file access: **100 ps**

Critical path for `lw`:

```
PC → Instruction Memory → Register File → ALU → Data Memory → Register File
     200ps                100+100=200ps     200ps    200ps         (write)
```

Total ≈ 200 + 200 + 200 + 200 = **800 ps** (approximate)

---

> *End of Lec07-2 (2) — The Processor: Design*
