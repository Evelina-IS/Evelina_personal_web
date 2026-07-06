# exercise 1 (sys)

## EXERCISE 1:basic conversion and range of two's complement

### convert the decimal number -105 into an 8-bit two's complement binary repretation.

- ANS :$105=1*2^6+1*2^5+1*2^2+1*2^1+1*2^0$

-  $\therefore 105_{(10)}=01100111_{(2)}$

- so the complete number is 01100111

### convert the 8-bit two's complement binary number 10011100 into its decimal equivalent

- the origin code is 10011011->11100100

- $\therefore -(2^6+2^5+2^2)=-100$

### what is the range of integers(in demical)that can be represented in an 8-bit two's complement system?

- I think we should divide this question into to 3 situation.

- Situation 1:there is no sign number and it is original code . The range of the number is 00000000 ~ 11111111. Therefore the integer range is 0~255.

- situation 2: there is a sign number and 7 machine number . Also it is original code. The range of the number is 11111111 ~ 01111111. Therefore the range of integer number is -127 ~ 127.

- situation 3: it adopts complete code:the code range is 10000000 ~ 01111111. Therefore the integer number range is -128～127

## addition/subtraction in two's complement

### Perform the following operations using 8-bit two's complement arithmetic. Determine whether overflow occurs in each case.

1. $(83)_{10}+(-45)_{10}$:

$$
\begin{gathered}
(82)_{10}=01010010_2\\
-45=10011101_2\\
complement number: 01010010  11100011;\\
\therefore ans=00110101=53\\
\end{gathered}
$$

- it is overflown.

2. $(-98)_{10}+(-67)_{10}$

$$
\begin{gathered}
(-98)_{10}=11100010_2\\

-67=11000011_2\\

complement number: 10011110    10111101\\

\therefore ans=01000011_(2)=67_{10}\\
\end{gathered}
$$

## IEEE 754 single-precision conversion

### converting the demical number -13.625 into the IEEE 754 standard single -precision (32-bit)floating -point format.

sign:1

$13.625_{10}=1101.101$

Exponent:3+127=130

$\therefore 10000010$
value:10110100000000000000000

**ANS**:1100 0001 0101 1010 0000 0000 0000 0000
=0xC1 5A 00 00

## interpreting IEEE754
### Given the hexadecimal representation of an IEEE 754 single-precision floating-point number: 0xC2E8 0000.

1.  Write down its binary form and break it down into the sign bit, exponent field, and mantissa (significand) field.
- binary form: 1100 0010 1110 1000 0000 0000 0000 0000
- sign bit: 1
- exponent bit: 10000101
- signidicand bit:1101000 0000 0000 0000 0000

2.  Calculate the decimal value it represents.
- exp:$128+4+1-127=6$
- sign:11101000 0000 0000 0000 0000:
$-1.1101_2=-1.8125_{10}$
$$
\begin{gathered}
\therefore \ answer \ \ is -1.8125*2^6\\
= -116
\end{gathered}
$$
