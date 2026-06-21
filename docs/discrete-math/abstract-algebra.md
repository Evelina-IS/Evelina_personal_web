# Lec 12: 抽象代数 (Abstract Algebra)

## 1. 代数结构

### 1.1 二元运算

集合 $S$ 上的**二元运算** $\circ$ 是 $S \times S \to S$ 的函数

| 性质 | 定义 |
|------|------|
| 封闭性 | $\forall a,b \in S, a\circ b \in S$ |
| 结合律 | $\forall a,b,c \in S, (a\circ b)\circ c = a\circ (b\circ c)$ |
| 交换律 | $\forall a,b \in S, a\circ b = b\circ a$ |
| 幺元 (identity) | $\exists e \in S, \forall a \in S, e\circ a = a\circ e = a$ |
| 逆元 (inverse) | $\forall a \in S, \exists b \in S, a\circ b = b\circ a = e$ |

### 1.2 代数系统

**代数系统** $(S, \circ_1, \circ_2, \ldots, \circ_k)$：集合 $S$ 和定义在 $S$ 上的若干运算构成

## 2. 群 (Group)

### 2.1 定义

群 $(G, \circ)$ 满足：
1. **封闭性**
2. **结合律**
3. **存在幺元** $e$
4. **每个元素有逆元**

### 2.2 群的分类

| 类型 | 附加条件 |
|------|----------|
| 阿贝尔群 (Abelian group) | 满足交换律 |
| 有限群 (finite group) | $G$ 是有限集合 |
| 无限群 (infinite group) | $G$ 是无限集合 |

### 2.3 子群 (Subgroup)

$H \subseteq G$ 是子群，当 $H$ 在群运算下也构成群

## 3. 环 (Ring)

环 $(R, +, \cdot)$ 满足：
1. $(R, +)$ 是**阿贝尔群**
2. $(R, \cdot)$ 是**半群**（满足结合律）
3. **分配律**：$a\cdot(b+c) = a\cdot b + a\cdot c$，$(b+c)\cdot a = b\cdot a + c\cdot a$

## 4. 域 (Field)

域 $(F, +, \cdot)$ 满足：
1. $(F, +)$ 是阿贝尔群（加法群）
2. $(F - \{0\}, \cdot)$ 是阿贝尔群（乘法群）
3. 分配律成立

**常见域**：$\mathbb{Q}$（有理数域）、$\mathbb{R}$（实数域）、$\mathbb{C}$（复数域）

---

[← 图论](graph-theory.md) | [下一章：语言分析 →](language-automata.md)
