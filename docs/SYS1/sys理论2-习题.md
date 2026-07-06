

## 2-1 Boolean Function Analysis

For the Boolean functions $E$ and $F$, as given in the following truth table:

|**X**|**Y**|**Z**|**E**|**F**|
|---|---|---|---|---|
|0|0|0|0|1|
|0|0|1|1|0|
|0|1|0|1|1|
|0|1|1|0|0|
|1|0|0|1|1|
|1|0|1|0|0|
|1|1|0|1|0|
|1|1|1|0|1|

**(a)** List the minterms and maxterms of each function. 
- minterms:$m_1,m_2,m_4,m_6$
- maxterms:$M_0,M_3,M_5,M_7$
**(b)** List the minterms of $\overline{E}$ and $\overline{F}$. 
- minterms:$m_0,m_3,m_5,m_7$
- maxterms:$M_1,M_2,M_4,M_6$
**(c)** List the minterms of $E + F$ and $E \cdot F$.
- E+F: $m_0,m_1,m_2,m_4,m_6,m_7$
- E*F:  $m_2,m_4$
**(d)** Express $E$ and $F$ in sum-of-minterms algebraic form.
- $E(X, Y, Z) = \overline{X}\overline{Y}Z + \overline{X}Y\overline{Z} + X\overline{Y}\overline{Z} + XY\overline{Z}$
- $F(X, Y, Z) = \overline{X}\overline{Y}\overline{Z} + \overline{X}Y\overline{Z} + X\overline{Y}\overline{Z} + XYZ$
**(e)** Simplify $E$ and $F$ to expressions with a minimum of literals.
- $E=\overline{XY}Z+Y\overline{Z}+X\overline{Z}$
- $F = \overline{Z} + XY$

---

## 2-2 Prime Implicants

*Find all the prime implicants for the following Boolean functions, and determine which are essential:

**(a)** $F(W, X, Y, Z) = \sum m (0, 2, 5, 7, 8, 10, 12, 13, 14, 15)$
prime implicants:
- $\overline{XZ}$
- $XZ$
- $WX$
- $WY$
Essential Prime Implicants:
- $\overline{XZ}$
- $XZ$
- $WX$

---

## 2-3 Optimization with Don't-Cares

*Optimize the following Boolean functions $F$ together with the don't-care conditions $d$. Find all prime implicants and essential prime implicants, and apply the selection rule.

**(b)** $F(W, X, Y, Z) = \sum m (0, 2, 4, 5, 8, 14, 15)$, 

- Prime Implicants: $\overline{X}\overline{Z}, \overline{W}\overline{Y}Z$, $XZ, WX, \overline{W}X\overline{Y}, \overline{Y}\overline{Z}$.
- Simplified Expression: $F = \overline{X}\overline{Z} + XZ + WX$ 
- Essential Prime Implicants: $\overline{X}\overline{Z}, XZ, WX$.
---

## 3-1 Hierarchical Components and Shannon's Expansion

A hierarchical component with the function $H = XY + XZ$ is to be used along with inverters to implement the following equation:

- $G = ABC + ABD + \overline{A}\overline{B}C + \overline{A}\overline{B}D$
    

The overall circuit can be obtained by using Shannon’s expansion theorem: $F = \overline{X} F_0(X) + X F_1(X)$ where $F_0(X)$ is $F$ evaluated with variable $X = 0$ and $F_1(X)$ is $F$ evaluated with variable $X = 1$. This expansion $F$ can be implemented with function $H$ by letting $Y = F_0$ and $Z = F_1$.

**Requirements:**

- The process can be repeated until all $F_i$’s are single literals or constants.
    
- For $G$, use $X = A$ to find $G_0$ and $G_1$ and then use $X = B$ for $G_0$ and $G_1$.
    
- Draw the top-level diagram for $G$ using $H$ as a hierarchical component.

**my provement**:
    

---

## 3-2 Decoder Design

1. Design a 4–to–16-line decoder using two 3–to–8-line decoders and 16 2-input AND gates.
    
2. Design a 4–to–16-line decoder with enable using five 2–to–4-line decoders with enable.

---

## 3-3 Combinational Circuit Design

Design a combinational circuit that compares two 4-bit unsigned numbers $A$ and $B$ to see whether $B$ is greater than $A$. The circuit has one output $X$, so that $X = 1$ if $A < B$ and $X = 0$ if $A \geq B$.