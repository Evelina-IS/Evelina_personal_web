# Lec 7-8: 谓词逻辑 (Predicate Logic)

## 1. 基本概念

### 1.1 谓词 (Predicate)

- 表示个体性质和个体间关系的词
- $P(x)$：$x$ 具有性质 $P$
- $R(x,y)$：$x$ 与 $y$ 具有关系 $R$

### 1.2 量词 (Quantifiers)

| 量词 | 符号 | 含义 |
|------|------|------|
| 全称量词 | $\forall$ | 所有的 |
| 存在量词 | $\exists$ | 存在 |

- $\forall x P(x)$：对所有 $x$，$P(x)$ 为真
- $\exists x P(x)$：存在 $x$ 使得 $P(x)$ 为真

### 1.3 约束变元与自由变元

- **约束变元 (bound variable)**：在量词作用域内的变元
- **自由变元 (free variable)**：不在任何量词作用域内的变元

### 1.4 量词否定等价式

$$\lnot \forall x P(x) \equiv \exists x \lnot P(x)$$

$$\lnot \exists x P(x) \equiv \forall x \lnot P(x)$$

## 2. 谓词演算的永真式

### 2.1 常用的永真式

| 公式 | 说明 |
|------|------|
| $\forall x P(x) \to P(t)$ | 全称示例 |
| $P(t) \to \exists x P(x)$ | 存在推广 |
| $\forall x (P(x) \to Q(x)) \land P(t) \to Q(t)$ | 全称假言推理 |
| $\forall x P(x) \lor \forall x Q(x) \to \forall x (P(x) \lor Q(x))$ | 分配律 |
| $\exists x (P(x) \land Q(x)) \to \exists x P(x) \land \exists x Q(x)$ | 分配律 |
| $\forall x (P(x) \land Q(x)) \equiv \forall x P(x) \land \forall x Q(x)$ | 全称合取分配 |
| $\exists x (P(x) \lor Q(x)) \equiv \exists x P(x) \lor \exists x Q(x)$ | 存在析取分配 |
| $\forall x \forall y P(x,y) \equiv \forall y \forall x P(x,y)$ | 全称交换 |
| $\exists x \exists y P(x,y) \equiv \exists y \exists x P(x,y)$ | 存在交换 |
| $\exists x \forall y P(x,y) \to \forall y \exists x P(x,y)$ | 单向（反之不成立） |

---

[← 逻辑等价、蕴涵与范式](logical-equivalence.md) | [下一章：集合论 →](set-theory.md)
