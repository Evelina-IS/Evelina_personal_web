# Probability Theory (概率论)

> English exam review notes — full glossary, formulas, and distributions.
> 全英考试复习笔记，包含中英文对照、公式和分布详解。

---

## Lec 1: Prerequisite Knowledge (前置知识)

### 1. Basic Concepts

#### Mathematical Definitions

- **Mutually Exclusive** (互斥): $A_i \cap A_j = \emptyset \quad (i \neq j)$
- **Collectively Exhaustive** (穷尽): $A_1 \cup A_2 \cup \cdots \cup A_n = S$
- **Independent** (独立): $P(AB) = P(A) \cdot P(B)$

#### English-Chinese Glossary (中英文对照表)

| English | 中文 |
|---------|------|
| set | 集合 |
| element | 元素 |
| union | 并集 |
| intersection | 交集 |
| complement | 补集 |
| mutually exclusive | 互斥 |
| disjoint | 不相交 |
| collectively exhaustive | 穷尽 |
| partition | 分割 |
| random experiment | 随机试验 |
| sample space | 样本空间 |
| event | 事件 |
| even | 偶数 |
| odd | 奇数 |
| independent | 独立 |

### 2. Important Formulas

#### Inclusion-Exclusion Principle (容斥原理)

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

$$P\left(\bigcup_{j=1}^{n} A_j\right) = \sum_{j=1}^{n} P(A_j) - \sum_{i<j} P(A_i \cap A_j) + \sum_{i<j<k} P(A_i \cap A_j \cap A_k) - \cdots + (-1)^{n-1} P(A_1 \cap A_2 \cap \cdots \cap A_n)$$

#### Conditional Probability (条件概率)

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

#### Multiplication Rule (乘法公式)

$$P(AB) = P(A) \cdot P(B \mid A) = P(B) \cdot P(A \mid B)$$

$$P(A_1 A_2 \ldots A_n) = P(A_1) \cdot P(A_2 \mid A_1) \cdot P(A_3 \mid A_1 A_2) \cdots P(A_n \mid A_1 A_2 \ldots A_{n-1})$$

$$P(ABC) = P(A \mid C) \cdot P(B \mid AC)$$

#### Law of Total Probability (全概率公式)

$$P(A) = \sum_{j=1}^{n} P(B_j) \cdot P(A \mid B_j)$$

#### Bayes' Theorem (贝叶斯公式)

$$P(B_k \mid A) = \frac{P(B_k) \cdot P(A \mid B_k)}{\sum_{j=1}^{n} P(B_j) \cdot P(A \mid B_j)}$$

### 3. Writing Conventions

- Use uppercase letters for random variables, e.g., $X$
- Use $S$ to denote the range of a random variable, e.g., $S_X$

---

## Lec 2: Probability Distributions (概率分布)

### 1. Basic Concepts

#### 1.1 Important Functions

**PMF — Probability Mass Function** (概率分布函数)

$$P_X(x) = P[X = x]$$

$$P_Y(y) = \sum_{x: g(x)=y} P_X(x)$$

**CDF — Cumulative Distribution Function** (累积分布函数)

$$F_X(x) = P[X \leq x]$$

$$P[x_1 \leq X \leq x_2] = F_X(x_2) - F_X(x_1)$$

**PDF — Probability Density Function** (概率密度函数)

$$f_X(x) = \frac{dF_X(x)}{dx}$$

$$f_X(x) \geq 0$$

$$F_X(x) = \int_{-\infty}^{x} f_X(u) du$$

$$\int_{-\infty}^{\infty} f_X(x) dx = 1$$

#### 1.2 Important Definitions

**Expected Value (期望值)**

- Discrete: $E[X] = \mu_X = \sum_{x \in S_X} x P_X(x)$
- Discrete: $E[g(x)] = \sum_{x \in S_X} g(x) P_X(x)$
- Continuous: $E[X] = \int_{-\infty}^{\infty} x f_X(x) dx$
- Continuous: $E[g(x)] = \int_{-\infty}^{\infty} g(x) f_X(x) dx$
- $E[X - \mu_X] = 0$
- $E[aX + b] = a E[X] + b$

**Variance (方差)**

$$Var[X] = E[(X - \mu_X)^2] = E[X^2] - (E[X])^2$$

$$Var[aX + b] = a^2 Var[X]$$

**Standard Deviation (标准差)**

$$\sigma_X = \sqrt{Var[X]}$$

**Moment (矩)**

- $n$-th moment: $E[X^n]$
- $n$-th central moment: $E[(X - \mu_X)^n]$

### 2. Discrete Random Variables

#### 2.1 Bernoulli(p) Random Variable

A single trial where the event either occurs or not.

$$P_X(x) = \begin{cases} 1-p & x = 0 \\ p & x = 1 \\ 0 & \text{otherwise} \end{cases}$$

- $E[X] = p$
- $Var[X] = p(1-p)$

#### 2.2 Geometric(p) Random Variable

Number of trials until the first success.

$$P_X(x) = \begin{cases} p(1-p)^{x-1} & x = 1,2,\ldots \\ 0 & \text{otherwise} \end{cases}$$

- $E[X] = 1/p$
- $Var[X] = (1-p)/p^2$

#### 2.3 Binomial(n,p) Random Variable

Number of successes in $n$ independent Bernoulli trials.

$$P_K(k) = \binom{n}{k} p^k (1-p)^{n-k}$$

- $E[X] = np$
- $Var[X] = np(1-p)$

**De Moivre-Laplace Formula** (棣莫弗-拉普拉斯公式):

$$P[k_1 \leq K \leq k_2] \approx \Phi\left(\frac{k_2 + 0.5 - np}{\sqrt{np(1-p)}}\right) - \Phi\left(\frac{k_1 - 0.5 - np}{\sqrt{np(1-p)}}\right)$$

#### 2.4 Pascal(k,p) Random Variable

Number of trials needed to get $k$ successes.

$$P_X(x) = \binom{x-1}{k-1} p^k (1-p)^{x-k}$$

- $E[X] = k/p$
- $Var[X] = k(1-p)/p^2$

#### 2.5 Discrete Uniform(k,l) Random Variable

$$P_X(x) = \begin{cases} 1/(l-k+1) & x = k, k+1, \ldots, l \\ 0 & \text{otherwise} \end{cases}$$

- $E[X] = (k+l)/2$
- $Var[X] = (l-k)(l-k+2)/12$

#### 2.6 Poisson(α) Random Variable

Describes the number of events in a fixed interval of time or space.

$$P_X(x) = \begin{cases} \alpha^x e^{-\alpha} / x! & x = 0,1,2,\ldots \\ 0 & \text{otherwise} \end{cases}$$

- $\alpha$ is the average rate of occurrence
- $E[X] = \alpha$
- $Var[X] = \alpha$

### 3. Continuous Random Variables

#### 3.1 Uniform Random Variable

$$f_X(x) = \begin{cases} 1/(b-a) & a \leq x \leq b \\ 0 & \text{otherwise} \end{cases}$$

$$F_X(x) = \begin{cases} 0 & x \leq a \\ (x-a)/(b-a) & a < x \leq b \\ 1 & x > b \end{cases}$$

- $E[X] = (a+b)/2$
- $Var[X] = (b-a)^2/12$

#### 3.2 Gaussian (Normal) Random Variable

**Standard Normal CDF**:

$$\Phi(z) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{z} e^{-u^2/2} du$$

**General Normal** $N(\mu, \sigma^2)$:

$$f_X(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

$$F_X(x) = \Phi\left(\frac{x-\mu}{\sigma}\right)$$

- $E[X] = \mu$
- $Var[X] = \sigma^2$

---

## Lec 3: Multivariate Random Variables (多维随机变量)

### 1. Basic Concepts

#### 1.1 Important Functions

**Joint PMF** (联合概率分布函数):

$$P_{X,Y}(x,y) = P[X = x, Y = y]$$

**Marginal PMF** (边际概率分布函数):

$$P_X(x) = \sum_{y \in S_Y} P_{X,Y}(x,y)$$

**Joint PDF** (联合概率密度函数):

$$F_{X,Y}(x) = \int_{-\infty}^{x} \int_{-\infty}^{y} f_{X,Y}(u,v) dv du$$

$$f_{X,Y}(x,y) = \frac{\partial^2 F_{X,Y}(x,y)}{\partial x \partial y}$$

**Conditional PMF** (条件概率分布函数):

$$P_{X \mid Y}(x \mid y) = P[X = x \mid Y = y] = \frac{P_{X,Y}(x,y)}{P_Y(y)}$$

#### 1.2 Conditional Expectation & Variance

**Law of Iterated Expectation** (迭代期望律):

$$E[X] = E[E[X \mid Y]]$$

**Law of Total Variance** (全方差律):

$$Var[X] = Var[E[X \mid Y]] + E[Var[X \mid Y]]$$

### 2. Independence (独立性)

Random variables $X$ and $Y$ are independent iff:

$$F_{X,Y}(x,y) = F_X(x) F_Y(y)$$

$$f_{X,Y}(x,y) = f_X(x) f_Y(y)$$

### 3. Covariance and Correlation

**Covariance** (协方差):

$$Cov[X,Y] = E[(X-\mu_X)(Y-\mu_Y)] = E[XY] - E[X]E[Y]$$

**Correlation Coefficient** (相关系数):

$$\rho_{X,Y} = \frac{Cov[X,Y]}{\sigma_X \sigma_Y}$$

- $-1 \leq \rho_{X,Y} \leq 1$
- If $X$ and $Y$ are independent, then $Cov[X,Y] = 0$

---

## Lec 4: Random Processes (随机过程)

### 1. Basic Concepts

**Definition**: A random process $X(t)$ is a function of time $t$ where each $X(t)$ is a random variable.

**Mean Function** (均值函数):

$$\mu_X(t) = E[X(t)]$$

**Autocorrelation Function** (自相关函数):

$$R_X(t, \tau) = E[X(t) X(t+\tau)]$$

**Autocovariance Function** (自协方差函数):

$$C_X(t, \tau) = R_X(t, \tau) - \mu_X(t) \mu_X(t+\tau)$$

### 2. Stationary Process (平稳过程)

A process $X(t)$ is **strict-sense stationary** (严平稳) if its joint PDF is invariant to time shifts:

$$f_{X(t_1), \ldots, X(t_n)}(x_1, \ldots, x_n) = f_{X(t_1+\tau), \ldots, X(t_n+\tau)}(x_1, \ldots, x_n)$$

### 3. Wide-Sense Stationary (WSS, 广义平稳)

A process $X(t)$ is WSS if:
- $E[X(t)] = \mu_X$ (constant mean)
- $R_X(t, \tau) = R_X(0, \tau) = R_X(\tau)$ (autocorrelation depends only on $\tau$)

**Properties**:

- $R_X(0) \geq 0$
- $R_X(\tau) = R_X(-\tau)$ (symmetry)
- $R_X(0) \geq |R_X(\tau)|$
- Average power: $R_X(0) = E[X^2(t)]$

### 4. Cross-Correlation (互相关)

$$R_{XY}(t, \tau) = E[X(t) Y(t+\tau)]$$

**Property**: $R_{XY}(\tau) = R_{YX}(-\tau)$

### 5. Gaussian Process (高斯过程)

- **Definition**: For any $k > 0$ and any set of time instants $t_1, \ldots, t_k$, the vector $\mathbf{X} = [X(t_1) \cdots X(t_k)]'$ is a Gaussian random vector.
- If $X(t)$ is WSS Gaussian, then $X(t)$ is also strict-sense stationary.

### 6. White Gaussian Noise (白高斯噪声)

- **Definition**: $W(t)$ is a stationary Gaussian process with $\mu_W = 0$ and $R_W(\tau) = \eta_0 \delta(\tau)$

---

## Key Summary Table

| Distribution | PMF/PDF | $E[X]$ | $Var[X]$ |
|---|---|---|---|
| Bernoulli(p) | $p^x(1-p)^{1-x}$ | $p$ | $p(1-p)$ |
| Geometric(p) | $p(1-p)^{x-1}$ | $1/p$ | $(1-p)/p^2$ |
| Binomial(n,p) | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Poisson(α) | $\alpha^x e^{-\alpha}/x!$ | $\alpha$ | $\alpha$ |
| Uniform(a,b) | $1/(b-a)$ | $(a+b)/2$ | $(b-a)^2/12$ |
| Normal(μ,σ²) | $\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ | $\mu$ | $\sigma^2$ |
