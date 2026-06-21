# Lec 5: 逻辑等价、蕴涵与范式

## 1. 逻辑等价与逻辑蕴含

### 1.1 逻辑等价式 (Logical Equivalence)

当命题公式 $A \leftrightarrow B$ 是重言式时，称 $A$ **逻辑等价**于 $B$，记作 $A \equiv B$。

#### 基本等价律

| 定律 | 公式 |
|------|------|
| 双重否定律 | $\lnot\lnot A \equiv A$ |
| 幂等律 | $A \lor A \equiv A$, $A \land A \equiv A$ |
| 交换律 | $A \lor B \equiv B \lor A$, $A \land B \equiv B \land A$ |
| 结合律 | $(A \lor B) \lor C \equiv A \lor (B \lor C)$, $(A \land B) \land C \equiv A \land (B \land C)$ |
| 分配律 | $A \land (B \lor C) \equiv (A \land B) \lor (A \land C)$, $A \lor (B \land C) \equiv (A \lor B) \land (A \lor C)$ |
| 德摩根律 | $\lnot(A \lor B) \equiv \lnot A \land \lnot B$, $\lnot(A \land B) \equiv \lnot A \lor \lnot B$ |
| 吸收律 | $A \lor (A \land B) \equiv A$, $A \land (A \lor B) \equiv A$ |
| 蕴涵等值式 | $A \to B \equiv \lnot A \lor B$ |
| 等价等值式 | $A \leftrightarrow B \equiv (A \to B) \land (B \to A)$ |
| 零律 | $A \lor T \equiv T$, $A \land F \equiv F$ |
| 同一律 | $A \lor F \equiv A$, $A \land T \equiv A$ |
| 排中律 | $A \lor \lnot A \equiv T$ |
| 矛盾律 | $A \land \lnot A \equiv F$ |
| 假言易位 | $A \to B \equiv \lnot B \to \lnot A$ |
| 归谬论 | $A \to B \land A \to \lnot B \equiv \lnot A$ |
| 等价等值式2 | $A \leftrightarrow B \equiv (A \land B) \lor (\lnot A \land \lnot B)$ |

### 1.2 逻辑蕴涵式 (Logical Implication)

当命题公式 $A \to B$ 是重言式时，称 $A$ **逻辑蕴涵** $B$，记做 $A \models B$。

- 公式 $A$ 的所有成真赋值都是公式 $B$ 的成真赋值
- $A \equiv B$ 可以看作 $A \models B \land B \models A$
- 推广形式：$\Gamma \models B$ — $\Gamma$ 中所有公式的合取逻辑蕴涵 $B$

#### 常用蕴涵式

| 蕴涵式 | 说明 |
|--------|------|
| $A \models A \lor B$ | 附加律 |
| $A \land B \models A$ | 化简律 |
| $A \land (A \to B) \models B$ | 假言推理 |
| $(A \to B) \land \lnot B \models \lnot A$ | 拒取式 |
| $\lnot A \land (A \lor B) \models B$ | 析取三段论 |
| $(A \to B) \land (B \to C) \models A \to C$ | 假言三段论 |
| $(A \to B) \land (C \to D) \models (A \land C) \to (B \land D)$ | |
| $(A \leftrightarrow B) \land (B \leftrightarrow C) \models A \leftrightarrow C$ | |

## 2. 代入原理与替换原理

- **代入原理**：将永真式 $A$ 中的某个命题变元全部替换为某个命题公式 $B$，结果仍为永真式
- **替换原理**：将公式 $A$ 中的子公式 $C$ 替换为与其逻辑等价的公式 $D$，结果与原公式等价

## 3. 范式 (Normal Forms)

### 3.1 基本概念

- **文字 (literal)**：命题变元或其否定，如 $p$、$\lnot p$
- **简单析取式**：仅由有限个文字构成的析取式，如 $p \lor \lnot q \lor r$
- **简单合取式**：仅由有限个文字构成的合取式，如 $p \land \lnot q \land r$

### 3.2 析取范式 (Disjunctive Normal Form, DNF)

- 有限个简单合取式的析取
- 例：$(p \land q) \lor (\lnot p \land r)$

### 3.3 合取范式 (Conjunctive Normal Form, CNF)

- 有限个简单析取式的合取
- 例：$(p \lor q) \land (\lnot p \lor r)$

### 3.4 主范式

- **主析取范式**：每个简单合取式都包含所有命题变元或其否定
- **主合取范式**：每个简单析取式都包含所有命题变元或其否定

---

[← 前置知识](index.md) | [下一章：谓词逻辑 →](predicate-logic.md)
