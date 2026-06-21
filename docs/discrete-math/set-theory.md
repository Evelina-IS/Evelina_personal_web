# Lec 9: 集合论 (Set Theory)

## 1. 集合基本概念

### 1.1 集合定义

- 把一些确定的、彼此不同的对象作为一个整体来研究，这个整体称为**集合** (set)
- 组成集合的对象叫做集合的**元素** (element)
- $a \in S$：$a$ 属于 $S$；$a \notin S$：$a$ 不属于 $S$

### 1.2 集合的表示法

- **列举法**：$A = \{1,2,3,4,5\}$
- **描述法**：$A = \{x \mid P(x)\}$

### 1.3 特殊集合

| 符号 | 含义 |
|------|------|
| $\emptyset$ | 空集 |
| $N$ | 自然数集 |
| $Z$ | 整数集 |
| $Q$ | 有理数集 |
| $R$ | 实数集 |
| $C$ | 复数集 |
| $U$ | 全集 |

### 1.4 集合的关系

| 关系 | 定义 | 记号 |
|------|------|------|
| 包含 | $A$ 的所有元素都属于 $B$ | $A \subseteq B$ |
| 真包含 | $A \subseteq B$ 且 $A \neq B$ | $A \subset B$ |
| 相等 | $A \subseteq B$ 且 $B \subseteq A$ | $A = B$ |

## 2. 集合基本运算

| 运算 | 定义 | 记号 |
|------|------|------|
| 并集 | $\{x \mid x \in A \lor x \in B\}$ | $A \cup B$ |
| 交集 | $\{x \mid x \in A \land x \in B\}$ | $A \cap B$ |
| 差集 | $\{x \mid x \in A \land x \notin B\}$ | $A - B$ 或 $A \setminus B$ |
| 补集 | $\{x \mid x \in U \land x \notin A\}$ | $\overline{A}$ 或 $A^c$ |
| 对称差 | $\{x \mid (x \in A) \oplus (x \in B)\}$ | $A \oplus B$ |

## 3. 笛卡尔积 (Cartesian Product)

$$A \times B = \{(a,b) \mid a \in A \land b \in B\}$$

## 4. 关系 (Relation)

### 4.1 基本概念

- 集合 $A$ 到 $B$ 的**二元关系**是 $A \times B$ 的子集
- 若 $R \subseteq A \times B$，且 $(a,b) \in R$，记作 $aRb$

### 4.2 关系矩阵

关系 $R$ 可以用矩阵 $M_R = (m_{ij})$ 表示，其中：
$$m_{ij} = \begin{cases} 1 & \text{若 } (a_i, b_j) \in R \\ 0 & \text{若 } (a_i, b_j) \notin R \end{cases}$$

### 4.3 关系的性质

| 性质 | 定义 | 条件 |
|------|------|------|
| 自反 | $aRa$ | $\forall a \in A$ |
| 反自反 | $a\not Ra$ | $\forall a \in A$ |
| 对称 | $aRb \to bRa$ | $\forall a,b \in A$ |
| 反对称 | $aRb \land bRa \to a = b$ | $\forall a,b \in A$ |
| 传递 | $aRb \land bRc \to aRc$ | $\forall a,b,c \in A$ |

### 4.4 等价关系 (Equivalence Relation)

- 同时满足**自反、对称、传递**的关系

**等价类**：$[a] = \{x \in A \mid xRa\}$

**划分**：等价关系将集合划分成若干个互不相交的等价类

### 4.5 序关系 (Order Relation)

- **偏序关系**：满足自反、反对称、传递
- **全序关系**：任意两个元素都可以比较的偏序
- **哈斯图 (Hasse diagram)**：偏序关系的图形表示

## 5. 函数 (Function)

- 函数 $f: A \to B$ 是 $A$ 到 $B$ 的一种特殊关系
- $\forall a \in A$，存在唯一的 $b \in B$ 使得 $(a,b) \in f$

| 类型 | 定义 |
|------|------|
| 单射 (injective) | $a_1 \neq a_2 \to f(a_1) \neq f(a_2)$ |
| 满射 (surjective) | $\forall b \in B, \exists a \in A, f(a)=b$ |
| 双射 (bijective) | 既是单射又是满射 |

---

[← 谓词逻辑](predicate-logic.md) | [下一章：图论 →](graph-theory.md)
