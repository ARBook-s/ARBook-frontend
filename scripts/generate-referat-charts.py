"""Генерация графиков для слайдов реферата (экспериментальная оценка)."""
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "docs" / "referat" / "charts"
OUT.mkdir(parents=True, exist_ok=True)

TEAL = "#0d5c63"
TEAL_LIGHT = "#3d8a90"
ACCENT = "#08464c"
GRID = "#e8ecef"
BG = "#ffffff"

plt.rcParams.update({
    "font.family": "Segoe UI",
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.labelsize": 11,
    "figure.facecolor": BG,
    "axes.facecolor": BG,
})


def style_ax(ax):
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)


def chart_glb_loading():
    labels = ["до 5 МБ", "5–15 МБ", "> 15 МБ"]
    values = [0.8, 1.6, 2.8]
    colors = [TEAL_LIGHT, TEAL, ACCENT]

    fig, ax = plt.subplots(figsize=(7, 4.2))
    bars = ax.bar(labels, values, color=colors, width=0.55, edgecolor="white", linewidth=1.2)
    for bar, v in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 0.08, f"{v} с",
                ha="center", va="bottom", fontweight="bold", color=ACCENT)
    ax.set_ylabel("Среднее время загрузки, с")
    ax.set_title("Загрузка GLB-моделей после обнаружения маркера")
    ax.set_ylim(0, 3.4)
    style_ax(ax)
    fig.tight_layout()
    fig.savefig(OUT / "01-glb-loading.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_session_startup():
    stages = ["Камера +\nMindAR", "combined-mind\n+ метаданные", "Первая модель\n(средн.)"]
    values = [0.6, 1.3, 2.4]
    cumulative = np.cumsum(values)

    fig, ax = plt.subplots(figsize=(7.5, 4.2))
    x = np.arange(len(stages))
    bars = ax.bar(x, values, color=[TEAL_LIGHT, TEAL, ACCENT], width=0.55, edgecolor="white")
    for i, (bar, v, c) in enumerate(zip(bars, values, cumulative)):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 0.06, f"{v} с",
                ha="center", fontweight="bold", color=ACCENT)
        if i == len(stages) - 1:
            ax.text(bar.get_x() + bar.get_width() / 2, -0.35, f"Σ ≤ {c:.1f} с",
                    ha="center", fontsize=10, color="#666")
    ax.set_xticks(x)
    ax.set_xticklabels(stages)
    ax.set_ylabel("Время, с")
    ax.set_title("Этапы запуска AR-сессии")
    ax.set_ylim(0, 3.2)
    style_ax(ax)
    fig.tight_layout()
    fig.savefig(OUT / "02-session-startup.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_fps():
    labels = ["Простая\nмодель", "Средняя\nмодель", "Сложная\n(анимация)"]
    fps_min = [28, 26, 24]
    fps_max = [30, 29, 28]
    mids = [(a + b) / 2 for a, b in zip(fps_min, fps_max)]

    fig, ax = plt.subplots(figsize=(7, 4.2))
    x = np.arange(len(labels))
    ax.axhline(30, color="#e67e22", linestyle="--", linewidth=1.5, label="TARGET_FPS = 30")
    for i, (lo, hi, m) in enumerate(zip(fps_min, fps_max, mids)):
        ax.plot([i, i], [lo, hi], color=TEAL, linewidth=4, solid_capstyle="round")
        ax.scatter(i, m, color=ACCENT, s=80, zorder=5)
        ax.text(i, hi + 0.6, f"{lo}–{hi}", ha="center", fontweight="bold", color=ACCENT)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel("FPS (кадров/с)")
    ax.set_title("Частота кадров при активном трекинге")
    ax.set_ylim(20, 33)
    ax.legend(loc="lower right", frameon=False)
    style_ax(ax)
    fig.tight_layout()
    fig.savefig(OUT / "03-fps.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_memory():
    labels = ["Инициализация\nAR", "1 модель", "3–4 маркера"]
    values = [122, 182, 255]  # середина диапазонов из главы 5
    errors = [7, 12, 15]

    fig, ax = plt.subplots(figsize=(7, 4.2))
    bars = ax.bar(labels, values, yerr=errors, capsize=6,
                   color=[TEAL_LIGHT, TEAL, ACCENT], width=0.55, edgecolor="white")
    for bar, v in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 18, f"~{v} МБ",
                ha="center", fontweight="bold", color=ACCENT)
    ax.set_ylabel("JS Heap, МБ")
    ax.set_title("Потребление оперативной памяти (Chrome)")
    ax.set_ylim(0, 320)
    style_ax(ax)
    fig.tight_layout()
    fig.savefig(OUT / "04-memory.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_tracking():
    distances = ["20 см", "50 см", "100 см", "150 см", "> 200 см"]
    # 5=стабильно, 4=незнач. потери, 2=нестабильно
    scores = [5, 5, 5, 3, 1]
    colors = ["#2ecc71" if s >= 5 else "#f1c40f" if s >= 3 else "#e74c3c" for s in scores]
    labels_y = {5: "Стабильно", 3: "Потери", 1: "Нестабильно"}

    fig, ax = plt.subplots(figsize=(7.5, 4.2))
    bars = ax.bar(distances, scores, color=colors, width=0.6, edgecolor="white")
    ax.set_yticks([1, 3, 5])
    ax.set_yticklabels(["Нестабильно", "Потери", "Стабильно"])
    ax.set_xlabel("Расстояние до маркера")
    ax.set_title("Устойчивость трекинга vs расстояние")
    for bar, s in zip(bars, scores):
        ax.text(bar.get_x() + bar.get_width() / 2, s + 0.15, labels_y[s],
                ha="center", fontsize=9, color="#444")
    style_ax(ax)
    ax.grid(axis="x", visible=False)
    fig.tight_layout()
    fig.savefig(OUT / "05-tracking-distance.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_radar_summary():
    categories = ["Трекинг", "Загрузка\nGLB", "Анимации\nи аудио", "FPS", "Память", "Устойчивость"]
    values = [90, 88, 92, 85, 82, 78]  # условная интегральная оценка %
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    values_plot = values + [values[0]]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(5.5, 5.5), subplot_kw=dict(polar=True))
    ax.plot(angles, values_plot, color=TEAL, linewidth=2)
    ax.fill(angles, values_plot, color=TEAL, alpha=0.2)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10)
    ax.set_ylim(0, 100)
    ax.set_yticks([20, 40, 60, 80, 100])
    ax.set_title("Интегральная оценка эффективности", pad=20, fontweight="bold")
    fig.tight_layout()
    fig.savefig(OUT / "06-efficiency-radar.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_user_benefits():
    """Сравнение печатной книги и ARBook по критериям пользы для пользователя."""
    criteria = [
        "Наглядность\n3D-объекта",
        "Вовлечённость\nв материал",
        "Понимание\nформы объекта",
        "Интерактив-\nность",
        "Доступность\n(без установки\nприложения)",
    ]
    book = [30, 35, 28, 15, 100]   # печатная книга
    arbook = [92, 88, 90, 95, 90]  # ARBook (PWA в браузере)

    x = np.arange(len(criteria))
    w = 0.36

    fig, ax = plt.subplots(figsize=(8.5, 4.5))
    b1 = ax.bar(x - w / 2, book, w, label="Печатная книга", color="#b0bec5", edgecolor="white")
    b2 = ax.bar(x + w / 2, arbook, w, label="ARBook (WebAR)", color=TEAL, edgecolor="white")

    for bars in (b1, b2):
        for bar in bars:
            h = bar.get_height()
            ax.text(bar.get_x() + bar.get_width() / 2, h + 2, f"{int(h)}",
                    ha="center", fontsize=9, fontweight="bold", color="#444")

    ax.set_xticks(x)
    ax.set_xticklabels(criteria, fontsize=9)
    ax.set_ylabel("Оценка пользы для пользователя (0–100)")
    ax.set_title("Сравнение: как система помогает пользователю")
    ax.set_ylim(0, 115)
    ax.legend(loc="upper right", frameon=False)
    style_ax(ax)

    fig.text(0.5, 0.02,
             "Экспертная оценка по результатам пользовательских сценариев (учащийся, преподаватель)",
             ha="center", fontsize=8.5, color="#666")
    fig.tight_layout(rect=[0, 0.04, 1, 1])
    fig.savefig(OUT / "07-user-benefits.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def chart_user_problems_solved():
    """Какие проблемы пользователя решает ARBook."""
    problems = [
        "Плоская\nиллюстрация",
        "Нет объёмного\nпредставления",
        "Отсутствие\nзвука",
        "Статичный\nконтент",
        "Сложность\nдоступа к AR",
    ]
    # Насколько проблема решена ARBook, %
    solved = [90, 88, 92, 85, 87]
    colors = [TEAL if v >= 85 else TEAL_LIGHT for v in solved]

    fig, ax = plt.subplots(figsize=(8, 4.2))
    y = np.arange(len(problems))
    bars = ax.barh(y, solved, color=colors, height=0.55, edgecolor="white")
    for bar, v in zip(bars, solved):
        ax.text(v + 1.5, bar.get_y() + bar.get_height() / 2, f"{v}%",
                va="center", fontweight="bold", color=ACCENT)
    ax.set_yticks(y)
    ax.set_yticklabels(problems)
    ax.set_xlabel("Степень решения проблемы, %")
    ax.set_title("Проблемы пользователя → решение в ARBook")
    ax.set_xlim(0, 105)
    ax.invert_yaxis()
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(OUT / "08-user-problems-solved.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    chart_glb_loading()
    chart_session_startup()
    chart_fps()
    chart_memory()
    chart_tracking()
    chart_radar_summary()
    chart_user_benefits()
    chart_user_problems_solved()
    print(f"Charts saved to {OUT}")
