
# RISC-V 指令分析 (RV32I)

假设有如下 RISC-V 指令 (RV32I)：

```r
loop:
    addi x6, x0, 0x10    # x6 = 0 + 16
    add  x7, x6, x6      # x7 = x6 + x6
    beq  x7, x6, next    # if x7 == x6, branch to next
    addi x5, x7, -4      # x5 = x7 - 4
next:
    sw   x5, 0(x2)       # storing x5 to memory
```

## (1)
`addi x6, x0, 0x10` 指令属于哪种 RISC-V 编码格式？ 
- 属于I-type的编码格式
请写出该指令每个字段的名称以及该指令中这些字段对应的二进制值。
- addi opcode：0010011
- x6 rd：00110
- addi function3: 000
- x0 rs1: 00000
- 0x10 imm:000000010000
## (2)
假设 `beq` 指令存储在地址 `0x10C`，标签 `next` 对应的地址为 `0x118`。  
请给出 `beq x7, x6, next` 指令中立即数的值（以字节为单位，并给出偏移量 displacement）。  
- 目标的地址0x118
- 当前的地址0x10c
- 偏移量：0x00c 12字节
- 所以立即数的大小是$12/4=3$ 
同时给出. B 型指令中该立即数的 12 位二进制补码表示。
- 0000 0000 0011
## (3)
假设执行前 `x2` 指向合法的内存地址，`x5, x6, x7` 均初始化为 `0`。  
上述代码执行完毕后，请分别给出 `x5, x6, x7` 的值，并回答 `beq` 指令是否真的发生分支跳转。

```r
addi x6,x0,0x10
# x6=0+16=16
addi x7,x6,x6
# x7=16+16=32
beq x7,x6,next
# x7!=x6   =>
addi x5,x7,-4
```
- 综上，不会发生跳转
- x5=28 x6=16 x7=32

