# RISC-V 汇编语言语法参考手册

> 本手册基于 lab5 课程实验内容编写，涵盖 RISC-V (RV64) 汇编的核心语法、指令集、函数调用约定及实例分析。

---

## 目录

1. [RISC-V 简介](#1-risc-v-简介)
2. [寄存器体系](#2-寄存器体系)
3. [汇编文件结构](#3-汇编文件结构)
4. [指令格式分类](#4-指令格式分类)
5. [核心指令详解](#5-核心指令详解)
6. [伪指令](#6-伪指令)
7. [函数调用约定](#7-函数调用约定)
8. [地址访问模式](#8-地址访问模式)
9. [完整实例分析](#9-完整实例分析)
10. [编译与模拟运行](#10-编译与模拟运行)

---

## 1. RISC-V 简介

### 1.1 什么是 RISC-V？

RISC-V 是一种基于**精简指令集计算机 (RISC)** 原则设计的**开源指令集架构 (ISA)**。它起源于 2010 年加州大学伯克利分校，采用简洁、模块化的设计理念。

### 1.2 特点

| 特性 | 说明 |
|------|------|
| **模块化** | 基础指令集 + 可选扩展，灵活组合 |
| **开源** | 完全免费，无专利壁垒 |
| **简洁** | 指令格式规整，易于实现 |
| **可扩展** | 支持自定义指令扩展 |
| **64位支持** | 原生支持 RV64，兼容 RV32 |

### 1.3 常见扩展

| 扩展名 | 全称 | 包含指令 |
|--------|------|---------|
| **RV64I** | 64位基础整数指令集 | 算术、逻辑、分支、加载/存储等 |
| **M** | 乘除法扩展 | `mul`, `div`, `rem` |
| **F** | 单精度浮点 | 浮点运算指令 |
| **D** | 双精度浮点 | 双精度浮点运算 |
| **A** | 原子操作 | 原子读-改-写指令 |
| **C** | 压缩指令 | 16位短指令 |

> 本 lab 主要使用 **RV64IM**（基础整数 + 乘除法扩展）。

---

## 2. 寄存器体系

### 2.1 通用寄存器

RISC-V 有 **32 个通用寄存器** (`x0` ~ `x31`)，每个 64 位宽 (RV64)。

| 寄存器 | ABI 名称 | 用途说明 | 调用约定 |
|:------:|:---------:|----------|:--------:|
| `x0` | `zero` | 硬连线为常数 0，写入无效 | — |
| `x1` | `ra` | **返回地址** (Return Address) | 调用者保存 |
| `x2` | `sp` | **栈指针** (Stack Pointer) | 被调用者保存 |
| `x3` | `gp` | **全局指针** (Global Pointer) | — |
| `x4` | `tp` | **线程指针** (Thread Pointer) | — |
| `x5` | `t0` | 临时寄存器/链接寄存器 | 调用者保存 |
| `x6`~`x7` | `t1`~`t2` | 临时寄存器 | 调用者保存 |
| `x8` | `s0` / `fp` | 保存寄存器 / 帧指针 | 被调用者保存 |
| `x9` | `s1` | 保存寄存器 | 被调用者保存 |
| `x10`~`x11` | `a0`~`a1` | **函数参数** / **返回值** | 调用者保存 |
| `x12`~`x17` | `a2`~`a7` | **函数参数** | 调用者保存 |
| `x18`~`x27` | `s2`~`s11` | 保存寄存器 | 被调用者保存 |
| `x28`~`x31` | `t3`~`t6` | 临时寄存器 | 调用者保存 |

### 2.2 特殊寄存器

| 寄存器 | 说明 |
|--------|------|
| `pc` | 程序计数器 (Program Counter)，指向当前指令地址 |
| `fflags` | 浮点异常标志 (F 扩展) |
| `frm` | 浮点舍入模式 (F 扩展) |

### 2.3 寄存器命名约定

```asm
# 两种命名方式完全等价，ABI 名称更具可读性
add x10, x11, x12    # 等同 add a0, a1, a2
add a0, a1, a2       # 更推荐
```

---

## 3. 汇编文件结构

### 3.1 基本结构

一个 RISC-V 汇编文件通常包含以下部分：

```asm
.section .text          # 代码段
.globl  function_name   # 声明为全局可见
.type   function_name, @function   # 声明为函数类型
function_name:          # 函数标签
    # 指令代码 ...

.section .rodata        # 只读数据段 (Read-Only Data)
msg:
    .string "Hello!\n"  # 定义字符串
    .word   1, 2, 3     # 定义 32 位整数数组

.data                   # 可读写数据段
var:
    .quad  0x1234       # 定义 64 位变量
buffer:
    .space 256          # 分配 256 字节空间，未初始化

.bss                    # 未初始化数据段
.comm  large_buf, 4096  # 声明 4096 字节全局缓冲区
```

### 3.2 常用汇编指示符 (Directives)

| 指示符 | 含义 | 示例 |
|--------|------|------|
| `.text` | 后续内容属于代码段 | `.text` |
| `.data` | 后续内容属于数据段 | `.data` |
| `.rodata` | 后续内容属于只读数据段 | `.section .rodata` |
| `.bss` | 后续内容属于未初始化数据段 | `.bss` |
| `.globl` | 声明符号为全局可见 | `.globl my_func` |
| `.type` | 声明符号类型 | `.type my_func, @function` |
| `.size` | 声明符号大小 | `.size my_func, .-my_func` |
| `.align` | 对齐到 2^n 字节边界 | `.align 3` (对齐到 8 字节) |
| `.word` | 定义 32 位数据 | `.word 0x12345678` |
| `.quad` | 定义 64 位数据 | `.quad 0x123456789ABCDEF0` |
| `.byte` | 定义 8 位数据 | `.byte 0xAB` |
| `.string` | 定义字符串 (自动加 `\0`) | `.string "hello"` |
| `.asciz` | 同上，定义以 null 结尾的字符串 | `.asciz "world"` |
| `.space` | 分配空间（字节数） | `.space 100` |
| `.option pic` | 启用位置无关代码 | `.option pic` |
| `.file` | 指定源文件名（编译器生成） | `.file "acc.c"` |
| `.ident` | 编译器标识信息 | `.ident "GCC: (Ubuntu)..."` |

### 3.3 从 lab5 实例看文件结构

**`acc_plain.s`（编译器生成的未优化版本）**：
```asm
    .file   "acc.c"             # 源文件信息
    .option pic                 # 位置无关代码
    .text                       # 代码段
    .align  1                   # 2 字节对齐
    .globl  acc                 # 全局可见
    .type   acc, @function      # 声明为函数
acc:
    # ... 函数体 ...
    .size   acc, .-acc          # 计算函数大小
    .ident  "GCC: ..."          # 编译器信息
    .section    .note.GNU-stack,"",@progbits   # 栈不可执行标记
```

**`switch.s`（含跳转表）**：
```asm
    .text
    .globl  switch_eg
switch_eg:
    # ... 指令代码 ...
    .section    .rodata         # 跳转表放在只读数据段
    .align  2                   # 4 字节对齐
.L4:
    .word   .L7-.L4             # 相对偏移（PC 相对）
    .word   .L6-.L4
    # ...
```

---

## 4. 指令格式分类

### 4.1 六种基本格式

RISC-V 所有指令都遵循规整的编码格式，这是其简洁性的核心：

```
R-type:  [funct7][rs2][rs1][funct3][rd][opcode]
         31-25   24-20 19-15 14-12  11-7 6-0

I-type:  [imm[11:0]][rs1][funct3][rd][opcode]
          31-20     19-15 14-12 11-7 6-0

S-type:  [imm[11:5]][rs2][rs1][funct3][imm[4:0]][opcode]
          31-25     24-20 19-15 14-12 11-7    6-0

B-type:  [imm[12|10:5]][rs2][rs1][funct3][imm[4:1|11]][opcode]
          31-25          24-20 19-15 14-12 11-7         6-0

U-type:  [imm[31:12]][rd][opcode]
          31-12     11-7 6-0

J-type:  [imm[20|10:1|11|19:12]][rd][opcode]
          31-12                  11-7 6-0
```

### 4.2 各类格式对应的指令

| 格式 | 指令类型 | 示例指令 |
|:----:|----------|----------|
| **R** | 寄存器-寄存器运算 | `add`, `sub`, `sll`, `mul`, `div`, `and`, `or`, `xor`, `slt` |
| **I** | 立即数运算 / 加载 | `addi`, `slli`, `andi`, `ori`, `xori`, `slti`, `ld`, `lw`, `lbu` |
| **S** | 存储 | `sd`, `sw`, `sh`, `sb` |
| **B** | 条件分支 | `beq`, `bne`, `blt`, `bge`, `bltu`, `bgeu` |
| **U** | 长立即数（高20位） | `lui`, `auipc` |
| **J** | 无条件跳转 | `jal` |

---

## 5. 核心指令详解

### 5.1 算术运算指令

#### 加法

```asm
# ---- 寄存器加法 (R型) ----
add  rd, rs1, rs2       # rd = rs1 + rs2

# 示例
add  t0, t1, t2         # t0 = t1 + t2
add  a0, a0, a5         # a0 += a5  （累加）

# ---- 立即数加法 (I型) ----
addi rd, rs1, imm       # rd = rs1 + sign_ext(imm)

# 示例
addi sp, sp, -48        # sp = sp - 48   （分配栈空间）
addi a5, a5, 1          # a5 = a5 + 1    （a5++）
addi t2, t2, -1         # t2 = t2 - 1    （递减）
addi a1, a1, 1          # a1 = a1 + 1    （递增）
```

#### 减法

```asm
# ---- 寄存器减法 (R型) ----
sub  rd, rs1, rs2       # rd = rs1 - rs2

# 示例
sub  t0, t1, t2         # t0 = t1 - t2
sub  t0, a1, s0         # t0 = a1 - s0
```

#### 乘法 (RV64M 扩展)

```asm
# ---- 乘法 (R型) ----
mul  rd, rs1, rs2       # rd = (rs1 * rs2)[63:0]（结果的低64位）

# 示例
mul  a0, a0, a4         # a0 = a0 * a4
mul  a5, a4, a5         # a5 = a4 * a5

# 其他乘法指令
mulh    rd, rs1, rs2    # rd = (rs1 * rs2)[127:64]（有符号高位）
mulhu   rd, rs1, rs2    # rd = (rs1 * rs2)[127:64]（无符号高位）
mulhsu  rd, rs1, rs2    # rd = (rs1 * rs2)[127:64]（有符号×无符号高位）
```

#### 除法与取模 (RV64M 扩展)

```asm
# ---- 除法 ----
div  rd, rs1, rs2       # rd = rs1 / rs2 （有符号整数除法）
divu rd, rs1, rs2       # rd = rs1 / rs2 （无符号整数除法）

# ---- 取模 ----
rem  rd, rs1, rs2       # rd = rs1 % rs2 （有符号取模）
remu rd, rs1, rs2       # rd = rs1 % rs2 （无符号取模）
```

### 5.2 逻辑运算指令

#### 按位与

```asm
# ---- 寄存器与 ----
and  rd, rs1, rs2       # rd = rs1 & rs2

# ---- 立即数与 ----
andi rd, rs1, imm       # rd = rs1 & sign_ext(imm)

# 示例
andi t3, t0, 15         # t3 = t0 & 0x0F （取低4位）
andi a1, a0, 1          # a1 = a0 & 1   （判断奇偶）
```

#### 按位或

```asm
# ---- 寄存器或 ----
or   rd, rs1, rs2       # rd = rs1 | rs2

# ---- 立即数或 ----
ori  rd, rs1, imm       # rd = rs1 | sign_ext(imm)
```

#### 按位异或

```asm
# ---- 寄存器异或 ----
xor  rd, rs1, rs2       # rd = rs1 ^ rs2

# ---- 立即数异或 ----
xori rd, rs1, imm       # rd = rs1 ^ sign_ext(imm)

# 示例
xor  t0, t0, t2         # t0 ^= t2   （phase_2 中的异或累加）
xori a0, a0, 13         # a0 ^= 13   （phase_3 中的异或操作）
```

#### 移位操作

```asm
# ---- 逻辑左移 ----
sll  rd, rs1, rs2       # rd = rs1 << rs2   （寄存器左移）
slli rd, rs1, imm       # rd = rs1 << imm   （立即数左移）

# ---- 逻辑右移 ----
srl  rd, rs1, rs2       # rd = rs1 >> rs2   （高位补0）
srli rd, rs1, imm       # rd = rs1 >> imm

# ---- 算术右移 ----
sra  rd, rs1, rs2       # rd = rs1 >> rs2   （高位补符号位）
srai rd, rs1, imm       # rd = rs1 >> imm

# 示例
slli a5, a5, 2          # a5 = a5 << 2   （乘以4，用于字对齐地址计算）
slli t0, s2, 2          # t0 = s2 * 4    （数组索引转字节偏移）
srli t1, a0, 3          # a0 右移 3 位    （phase_3 中的位操作）
slli t0, a0, 7          # a0 左移 7 位    （phase_3 中的位操作）
```

### 5.3 数据传输指令（加载与存储）

#### 加载指令 (I型)

```asm
# RV64 下的加载指令（所有加载到 rd 的都是 I 型）
ld   rd, offset(rs1)    # 加载 64 位双字 (Doubleword)
lw   rd, offset(rs1)    # 加载 32 位字，符号扩展至 64 位 (Word)
lwu  rd, offset(rs1)    # 加载 32 位字，零扩展至 64 位
lh   rd, offset(rs1)    # 加载 16 位半字，符号扩展 (Halfword)
lhu  rd, offset(rs1)    # 加载 16 位半字，零扩展
lb   rd, offset(rs1)    # 加载 8 位字节，符号扩展 (Byte)
lbu  rd, offset(rs1)    # 加载 8 位字节，零扩展

# 示例 (来自 lab5)：
lw   a5, 0(a5)          # 从跳转表加载 32 位值：a5 = *(int*)(a5)
ld   a5, -40(s0)        # 从栈上加载 64 位值：a5 = *(long long*)(s0-40)
ld   a4, -32(s0)        # 从栈上加载累加结果
lbu  t2, 0(t1)          # 加载 1 字节（无符号）：t2 = *(unsigned char*)(t1)
```

#### 存储指令 (S型)

```asm
# RV64 下的存储指令
sd   rs2, offset(rs1)   # 存储 64 位双字
sw   rs2, offset(rs1)   # 存储 32 位字
sh   rs2, offset(rs1)   # 存储 16 位半字
sb   rs2, offset(rs1)   # 存储 8 位字节

# 示例 (来自 lab5)：
sd   a0, -40(s0)        # 将参数 a0 保存到栈上偏移 -40 处
sd   a1, -48(s0)        # 将参数 a1 保存到栈上偏移 -48 处
sd   zero, -32(s0)      # 将 0 保存到栈上 (res = 0)
sd   a5, -24(s0)        # 将循环变量保存到栈上
```

### 5.4 条件分支指令 (B型)

#### 比较并跳转

```asm
# ---- 相等 / 不等 ----
beq  rs1, rs2, label    # if (rs1 == rs2) goto label
bne  rs1, rs2, label    # if (rs1 != rs2) goto label

# ---- 小于（有符号）----
blt  rs1, rs2, label    # if (rs1 < rs2) goto label

# ---- 小于（无符号）----
bltu rs1, rs2, label    # if (rs1 < rs2) goto label （无符号比较）

# ---- 大于等于（有符号）----
bge  rs1, rs2, label    # if (rs1 >= rs2) goto label
bgeu rs1, rs2, label    # if (rs1 >= rs2) goto label （无符号比较）

# 示例 (来自 lab5)：
ble   a4, a5, .L3       # if (a4 <= a5) goto .L3   （循环条件判断）
bne   a5, zero, .L2     # if (a5 != 0) goto .L2    （if 分支）
bne   a5, a1, .L3       # if (a5 != a1) goto .L3   （循环末尾判断）
beq   a5, zero, .L1     # if (a5 == 0) goto .L1    （基础情况）
bgt   a0, a1, .L4       # if (a0 > a1) goto .L4    （acc 优化版中的边界检查）
bgtu  a5, a4, .L8       # if (a5 > a4) goto .L8    （switch 中的范围检查，无符号）
bne   t3, t4, 2f        # if (t3 != t4) goto 2f    （字符串比较）
```

### 5.5 无条件跳转指令

#### 跳转并链接 (J型 / I型)

```asm
# ---- 跳转并链接 (J型，PC相对) ----
jal  rd, label           # rd = PC+4; goto label
                          # 通常 rd = ra (x1) 用于函数调用

# ---- 跳转并链接寄存器 (I型，寄存器相对) ----
jalr rd, offset(rs1)     # rd = PC+4; goto rs1 + offset

# 示例：
jal  ra, factor          # 调用 factor 函数
jal  ra, fibonacci       # 调用 fibonacci 函数
jal  ra, acc             # 调用 acc 函数
```

#### 函数返回

```asm
# ---- 返回 (伪指令 ret 等价于 jalr zero, ra, 0) ----
ret                      # goto ra (函数返回)
# 等价于
jalr zero, ra, 0         # 不保存返回地址，直接跳转到 ra

# 或者使用 jr（也是伪指令）
jr   ra                  # goto ra

# 示例 (来自 lab5)：
ret                      # 函数末尾返回
jr   ra                  # 另一种写法
```

#### 无条件跳转（伪指令）

```asm
# ---- 无条件跳转 (伪指令 j 等价于 jal zero, label) ----
j    label               # goto label
# 等价于
jal  zero, label

# 示例 (来自 lab5)：
j    .L2                 # 跳转到 .L2 标签
j    .L3                 # 跳转到 .L3 标签
j    3f                  # 跳转到前向标签 3
```

### 5.6 比较并置位指令

```asm
# ---- 有符号小于置位 (R型) ----
slt  rd, rs1, rs2       # rd = (rs1 < rs2) ? 1 : 0

# ---- 无符号小于置位 ----
sltu rd, rs1, rs2       # rd = (rs1 < rs2) ? 1 : 0 （无符号）

# ---- 立即数版本 (I型) ----
slti rd, rs1, imm       # rd = (rs1 < imm) ? 1 : 0
sltiu rd, rs1, imm      # rd = (rs1 < imm) ? 1 : 0 （无符号）
```

### 5.7 加载立即数

```asm
# ---- 加载高位立即数 (U型) ----
lui  rd, imm20          # rd = imm20 << 12 （加载高 20 位，低 12 位为 0）

# ---- 加载 PC 相对地址 (U型) ----
auipc rd, imm20         # rd = PC + (imm20 << 12)

# ---- 伪指令 li (load immediate) ----
li   rd, immediate      # 加载任意 64 位立即数
                        # 汇编器自动拆分为多条指令

# 示例 (来自 lab5)：
li   a0, 1              # a0 = 1
li   a0, 0              # a0 = 0
li   a4, 6              # a4 = 6 （switch 范围上限）
li   a5, 1              # a5 = 1
```

### 5.8 地址加载伪指令

```asm
# ---- 加载地址 (伪指令) ----
la   rd, label          # rd = label 的地址

# ---- 加载 PC 相对地址 (伪指令) ----
lla  rd, label          # rd = label 的地址（使用 PC 相对寻址）
                        # 等价于 auipc + addi

# 示例 (来自 lab5)：
lla  a4, .L4            # a4 = 跳转表 .L4 的地址 （用于 switch 跳转表）
la   t1, expect         # t1 = expect 数组的首地址 （phase_3 中的字符串比较）
```

---

## 6. 伪指令

伪指令是汇编器提供的"语法糖"，会被自动翻译成一条或多条真实指令。

### 6.1 常用伪指令一览

| 伪指令 | 等价指令 | 说明 |
|--------|----------|------|
| `nop` | `addi x0, x0, 0` | 空操作 |
| `li rd, imm` | 多条指令组合 | 加载任意立即数 |
| `la rd, label` | `auipc rd, ...` + 其他 | 加载符号地址 |
| `lla rd, label` | `auipc rd, ...` + `addi` | 加载 PC 相对地址 |
| `mv rd, rs` | `addi rd, rs, 0` | 寄存器复制 |
| `neg rd, rs` | `sub rd, x0, rs` | 取负 |
| `negw rd, rs` | `subw rd, x0, rs` | 字取负 (RV64) |
| `not rd, rs` | `xori rd, rs, -1` | 按位取反 |
| `seqz rd, rs` | `sltiu rd, rs, 1` | 判断是否等于零 |
| `snez rd, rs` | `sltu rd, x0, rs` | 判断是否不等于零 |
| `sltz rd, rs` | `slt rd, rs, x0` | 判断是否小于零 |
| `sgtz rd, rs` | `slt rd, x0, rs` | 判断是否大于零 |
| `bnez rs, label` | `bne rs, x0, label` | 不等于零跳转 |
| `beqz rs, label` | `beq rs, x0, label` | 等于零跳转 |
| `blez rs, label` | `ble rs, x0, label` | ≤ 0 跳转 |
| `bgez rs, label` | `bge rs, x0, label` | ≥ 0 跳转 |
| `bltz rs, label` | `blt rs, x0, label` | < 0 跳转 |
| `bgtz rs, label` | `bgt rs, x0, label` | > 0 跳转 |
| `bgt rs1, rs2, label` | `blt rs2, rs1, label` | 大于跳转 |
| `ble rs1, rs2, label` | `bge rs2, rs1, label` | 小于等于跳转 |
| `bgtu rs1, rs2, label` | `bltu rs2, rs1, label` | 无符号大于跳转 |
| `bleu rs1, rs2, label` | `bgeu rs2, rs1, label` | 无符号小于等于跳转 |
| `j label` | `jal x0, label` | 无条件跳转 |
| `jal label` | `jal x1, label` | 函数调用（隐式 ra） |
| `call label` | `jal ra, label` | 函数调用（远程） |
| `ret` | `jalr x0, ra, 0` | 函数返回 |
| `jr rs` | `jalr x0, rs, 0` | 跳转到寄存器地址 |
| `jalr rs` | `jalr x1, rs, 0` | 间接调用 |

### 6.2 lab5 中使用的伪指令示例

```asm
# mv — 寄存器复制
mv   a5, a0             # a5 = a0  （保存参数）
mv   a0, a5             # a0 = a5  （设置返回值）
mv   s1, a0             # s1 = a0  （保存 fib(n-1) 的结果）

# li — 加载立即数
li   a0, 0              # a0 = 0   （设置返回值 0）
li   a5, 1              # a5 = 1   （加载常数 1）
li   a4, 6              # a4 = 6   （加载常数 6）

# ret — 函数返回
ret                      # 从函数返回

# j — 无条件跳转
j    .L2                 # 跳转到标签 .L2
j    .L3                 # 跳转到标签 .L3

# lla — 加载 PC 相对地址
lla  a4, .L4            # 加载跳转表地址
```

---

## 7. 函数调用约定

### 7.1 参数传递规则

| 参数位置 | 寄存器 | 说明 |
|:--------:|:------:|------|
| 第1个参数 | `a0` (x10) | 整数/指针 |
| 第2个参数 | `a1` (x11) | 整数/指针 |
| 第3个参数 | `a2` (x12) | 整数/指针 |
| 第4个参数 | `a3` (x13) | 整数/指针 |
| 第5个参数 | `a4` (x14) | 整数/指针 |
| 第6个参数 | `a5` (x15) | 整数/指针 |
| 第7个参数 | `a6` (x16) | 整数/指针 |
| 第8个参数 | `a7` (x17) | 整数/指针 |
| 更多参数 | 栈上传递 | 从右到左压栈 |

### 7.2 返回值

| 返回值大小 | 寄存器 |
|:----------:|:------:|
| ≤ 64 位 | `a0` |
| 128 位 | `a0` (低64位) + `a1` (高64位) |

### 7.3 寄存器保存约定

**调用者保存 (Caller-saved)** — 调用前若值还要用，需自行保存到栈上：
- `ra` (x1) — 返回地址
- `t0`~`t6` (x5~x7, x28~x31) — 临时寄存器
- `a0`~`a7` (x10~x17) — 参数寄存器

**被调用者保存 (Callee-saved)** — 被调函数若使用，必须保存并恢复：
- `sp` (x2) — 栈指针
- `s0`~`s11` (x8~x9, x18~x27) — 保存寄存器

### 7.4 函数调用栈帧模板

#### 标准函数（需要保存寄存器）

```asm
# === 函数序言 (Prologue) ===
func_name:
    addi    sp, sp, -FRAMESIZE    # 分配栈帧空间（FRAMESIZE = 保存的寄存器数 × 8 + 局部变量大小）
    sd      ra, OFFSET_RA(sp)     # 保存返回地址
    sd      s0, OFFSET_S0(sp)     # 保存被调用者保存寄存器
    sd      s1, OFFSET_S1(sp)     # （根据需要使用）
    # ... 可选的更多 sd ...

    # === 函数体 ===
    # ... 实际功能代码 ...

    # === 函数尾声 (Epilogue) ===
    ld      ra, OFFSET_RA(sp)     # 恢复返回地址
    ld      s0, OFFSET_S0(sp)     # 恢复寄存器
    # ... 保存了多少 sd，就用多少 ld 恢复 ...
    addi    sp, sp, FRAMESIZE      # 回收栈帧
    ret                           # 返回
```

#### 示例：`factor_plain.s` 中的递归函数

```asm
factor:
    addi    sp, sp, -32           # 分配 32 字节栈帧
    sd      ra, 24(sp)            # 保存返回地址
    sd      s0, 16(sp)            # 保存 s0
    addi    s0, sp, 32            # 设置帧指针 s0 = old sp
    sd      a0, -24(s0)           # 将参数 n 保存到栈上

    ld      a5, -24(s0)           # 加载 n
    bne     a5, zero, .L2         # if (n != 0) goto 递归分支
    li      a5, 1                 # else return 1
    j       .L3

.L2:
    ld      a5, -24(s0)           # 加载 n
    addi    a5, a5, -1            # a5 = n - 1
    mv      a0, a5                # 设置参数 a0 = n-1
    call    factor                # 递归调用 factor(n-1)
    mv      a4, a0                # a4 = factor(n-1)
    ld      a5, -24(s0)           # 加载 n
    mul     a5, a4, a5            # a5 = factor(n-1) * n

.L3:
    mv      a0, a5                # 设置返回值
    ld      ra, 24(sp)            # 恢复返回地址
    ld      s0, 16(sp)            # 恢复 s0
    addi    sp, sp, 32            # 回收栈帧
    jr      ra                    # 返回
```

#### 示例：`acc_plain.s` 中的栈帧使用

```asm
acc:
    addi    sp, sp, -48           # 分配 48 字节栈帧
    sd      s0, 40(sp)            # 保存 s0
    addi    s0, sp, 48            # 帧指针指向栈顶

    sd      a0, -40(s0)           # 栈上保存参数 a (a0)
    sd      a1, -48(s0)           # 栈上保存参数 b (a1)
    sd      zero, -32(s0)         # res = 0 （存栈上）
    ld      a5, -40(s0)           # a5 = a
    sd      a5, -24(s0)           # i = a （存栈上）
    j       .L2                   # 跳转到条件判断

.L3:                              # 循环体
    ld      a4, -32(s0)           # a4 = res
    ld      a5, -24(s0)           # a5 = i
    add     a5, a4, a5            # a5 = res + i
    sd      a5, -32(s0)           # res = res + i
    ld      a5, -24(s0)           # a5 = i
    addi    a5, a5,