<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>АртХаус · Календарь</title>
    <style>
        * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0; }
        body { background: #f4f6fa; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 16px; }
        .app { max-width: 950px; width: 100%; background: white; border-radius: 32px; padding: 24px 20px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        h1 { font-weight: 600; font-size: 1.8rem; color: #0b1b33; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        h1 small { font-size: 0.9rem; font-weight: 400; color: #4a5b7a; margin-left: 8px; }
        .status-badge { font-size: 0.7rem; padding: 2px 12px; border-radius: 20px; margin-left: 12px; background: #22c55e; color: white; }
        .status-badge.offline { background: #ef4444; }
        .status-badge.loading { background: #f59e0b; }
        .status-badge.admin { background: #8b5cf6; }
        .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 24px; }
        .field { flex: 1 1 160px; min-width: 130px; }
        .field label { display: block; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3px; color: #2c3e5c; margin-bottom: 4px; }
        .field select, .field input { width: 100%; padding: 10px 12px; border: 1px solid #d0d9e8; border-radius: 14px; font-size: 0.95rem; background: white; transition: 0.2s; outline: none; }
        .field select:focus, .field input:focus { border-color: #2b6c8f; box-shadow: 0 0 0 3px rgba(43, 108, 143, 0.15); }
        .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
        .btn { background: #eef2f7; border: none; padding: 10px 18px; border-radius: 30px; font-weight: 500; font-size: 0.9rem; color: #1a2a44; cursor: pointer; transition: 0.15s; display: inline-flex; align-items: center; gap: 6px; border: 1px solid transparent; }
        .btn-primary { background: #1d3b5c; color: white; }
        .btn-primary:hover { background: #143049; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-success { background: #22c55e; color: white; }
        .btn-success:hover { background: #16a34a; }
        .btn-success:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-admin { background: #8b5cf6; color: white; }
        .btn-admin:hover { background: #7c3aed; }
        .btn-admin.active { background: #ef4444; }
        .btn-admin.active:hover { background: #dc2626; }
        .legend { display: flex; flex-wrap: wrap; gap: 20px 28px; background: #f8faff; padding: 12px 16px; border-radius: 40px; margin-bottom: 22px; font-size: 0.85rem; align-items: center; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .dot { width: 14px; height: 14px; border-radius: 20px; }
        .dot.green { background: #2b8c5e; }
        .dot.yellow { background: #d9a13b; }
        .dot.red { background: #bc4b4b; }
        .stats { margin-left: auto; color: #2b405e; font-weight: 450; }
        .calendar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 4px; background: #eef2f8; padding: 4px; border-radius: 20px; margin-bottom: 28px; position: relative; }
        .day-cell { background: white; border-radius: 12px; aspect-ratio: 1/1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 500; color: #1d2d44; border: 1px solid #e0e7f0; padding: 2px; line-height: 1.3; position: relative; cursor: default; }
        .day-cell .date { font-size: 0.8rem; font-weight: 600; }
        .day-cell .count { font-size: 0.6rem; background: #eef3fc; padding: 0 5px; border-radius: 20px; color: #1f3b5c; margin-top: 1px; }
        .day-cell.has-event { border-color: #bccbe0; background: #fbfdff; }
        .day-cell.green-bg { background: #c6f0d9; border-color: #2b8c5e; }
        .day-cell.yellow-bg { background: #f7e9b0; border-color: #d9a13b; }
        .day-cell.red-bg { background: #fad6d6; border-color: #bc4b4b; }

        /* ===== TOOLTIP ===== */
        .day-cell .tooltip {
            display: none;
            position: fixed;
            background: #1e293b;
            color: white;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 400;
            max-width: 260px;
            width: max-content;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 999;
            pointer-events: none;
            line-height: 1.5;
            white-space: normal;
            word-break: break-word;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .day-cell .tooltip::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1e293b;
        }
        .day-cell .tooltip .tooltip-title {
            font-weight: 600;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            margin-bottom: 4px;
        }
        .day-cell .tooltip .tooltip-name {
            padding: 2px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .day-cell .tooltip .tooltip-name:last-child {
            border-bottom: none;
        }
        .day-cell:hover .tooltip { display: block; }

        .member-list { background: #f8fafd; border-radius: 24px; padding: 16px 12px; }
        .member-list h3 { font-weight: 500; font-size: 1rem; color: #1f385a; margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .member-tags { display: flex; flex-wrap: wrap; gap: 8px; max-height: 260px; overflow-y: auto; padding-right: 4px; }
        .member-tag { background: white; border-radius: 30px; padding: 5px 14px 5px 12px; font-size: 0.9rem; border: 1px solid #d8e1ee; display: inline-flex; align-items: center; gap: 8px; position: relative; }
        .member-tag .status-dot { width: 12px; height: 12px; border-radius: 20px; display: inline-block; }
        .member-tag .status-dot.green { background: #2b8c5e; }
        .member-tag .status-dot.yellow { background: #d9a13b; }
        .member-tag .status-dot.red { background: #bc4b4b; }
        .member-tag .delete-btn { background: none; border: none; color: #a03a3a; cursor: pointer; font-size: 1rem; padding: 0 2px; line-height: 1; opacity: 0.5; transition: 0.15s; display: none; }
        .member-tag .delete-btn:hover { opacity: 1; color: #dc2626; }
        .member-tag.admin-mode .delete-btn { display: inline-block; }
        .empty-message { color: #5b6f8c; font-style: italic; padding: 8px 0; }
        .loading { text-align: center; padding: 20px; color: #5b6f8c; }
        .footer { margin-top: 18px; display: flex; justify-content: space-between; color: #6f7f9a; font-size: 0.8rem; align-items: center; flex-wrap: wrap; gap: 8px; }
        .refresh-btn { background: none; border: none; color: #4a5b7a; cursor: pointer; font-size: 0.8rem; text-decoration: underline; }
        .refresh-btn:hover { color: #1d3b5c; }
        .admin-panel { display: none; background: #f3f0ff; border-radius: 16px; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #d8cff0; align-items: center; gap: 12px; flex-wrap: wrap; }
        .admin-panel.show { display: flex; }
        .admin-panel .hint { color: #5b21b6; font-size: 0.85rem; }
        .admin-panel .hint strong { color: #4c1d95; }
        .admin-logout-btn { background: #dc2626; color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; }
        .admin-logout-btn:hover { background: #b91c1c; }
        .password-modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
        .password-modal.show { display: flex; }
        .password-modal-content { background: white; padding: 32px; border-radius: 24px; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .password-modal-content h2 { margin-bottom: 16px; color: #0b1b33; }
        .password-modal-content input { width: 100%; padding: 12px 16px; border: 1px solid #d0d9e8; border-radius: 14px; font-size: 1rem; margin-bottom: 12px; outline: none; }
        .password-modal-content input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
        .password-modal-content .btn-row { display: flex; gap: 10px; justify-content: flex-end; }
        .success-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #22c55e; color: white; padding: 12px 24px; border-radius: 30px; font-weight: 500; box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3); z-index: 2000; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
        .success-toast.show { opacity: 1; pointer-events: auto; }
        @media (max-width: 480px) { .app { padding: 16px; } .row { flex-direction: column; align-items: stretch; } .field { flex: 1; } .legend { gap: 8px; } }
    </style>
</head>
<body>
<div class="app">
    <h1>🏠 АртХаус <small>общий календарь</small> <span class="status-badge" id="statusBadge">🟢 Онлайн</span></h1>

    <!-- АДМИН-ПАНЕЛЬ -->
    <div class="admin-panel" id="adminPanel">
        <span class="hint">🔐 <strong>Админ-режим</strong> — у каждого участника появилась кнопка удаления</span>
        <button class="admin-logout-btn" id="adminLogoutBtn">🚪 Выйти</button>
    </div>

    <div class="row">
        <div class="field">
            <label for="nameSelect">Участник</label>
            <select id="nameSelect"></select>
        </div>
        <div class="field">
            <label for="dateInput">Дата приезда</label>
            <input type="date" id="dateInput" min="2026-08-01" max="2026-09-30">
        </div>
        <div class="actions">
            <button class="btn btn-success" id="hereBtn">📍 Я в городе</button>
            <button class="btn btn-primary" id="addBtn">➕ Добавить</button>
            <button class="btn btn-admin" id="adminBtn">🔑 Админ</button>
        </div>
    </div>

    <div class="legend">
        <span class="legend-item"><span class="dot green"></span> в городе</span>
        <span class="legend-item"><span class="dot yellow"></span> до 30 авг</span>
        <span class="legend-item"><span class="dot red"></span> после 30 авг</span>
        <span class="stats" id="statsCounter">0 участников</span>
    </div>

    <div class="calendar-grid" id="calendarGrid"><div class="loading">⏳ Загрузка...</div></div>

    <div class="member-list">
        <h3>👥 Участники</h3>
        <div id="memberListContainer" class="member-tags"></div>
    </div>
    <div class="footer">
        <span>⚡ данные в облачной базе</span>
        <span><button class="refresh-btn" id="refreshBtn">🔄 обновить</button> <span id="updateTime"></span></span>
    </div>
</div>

<!-- ТОСТ УВЕДОМЛЕНИЕ -->
<div class="success-toast" id="toast"></div>

<!-- МОДАЛКА ДЛЯ ПАРОЛЯ -->
<div class="password-modal" id="passwordModal">
    <div class="password-modal-content">
        <h2>🔐 Вход в админ-режим</h2>
        <p style="color: #5b6f8c; margin-bottom: 16px;">Введите пароль для управления записями</p>
        <input type="password" id="passwordInput" placeholder="Введите пароль...">
        <div class="btn-row">
            <button class="btn" id="passwordCancelBtn">Отмена</button>
            <button class="btn btn-admin" id="passwordConfirmBtn">Войти</button>
        </div>
    </div>
</div>

<script>
    // ============================================================
    // НАСТРОЙКИ
    // ============================================================
    const API_URL = 'https://arthouse-api.onrender.com';
    const ADMIN_PASSWORD = 'admin123';

    // ============================================================
    // СПИСОК УЧАСТНИКОВ
    // ============================================================
    const MEMBER_NAMES = [
        "Алмаскызы Айсулу", "Амангелдина Сабина", "Әбіш Нұрәлім", "Әшімахун Айзере",
        "Байділдә Балжан", "Бақтығұмар Махабат", "Бақтығұмар Мөлдір", "Бахтиярова Эльмира",
        "Бекбосын Даурен", "Бекубаева Қымбат", "Буранкулов Батырхан", "Бушуков Алимхан",
        "Джумагалиев Абай", "Ермекбаев Мансур", "Ескендиров Артур", "Жумабекова Ақерке",
        "Жусупова Адема", "Жұрмағанбетов Алияр", "Исудуллаева Малика", "Кайсар Аймира",
        "Кан Владислав", "Касжанова Алтынай", "Кәріпбек Жанерке", "Крамаров Максим",
        "Куанышбаев Азамат", "Курасбай Жумат", "Курманова Алина", "Кусукпаева Аида",
        "Мамаджанов Фазлидин", "Манарбеков Куаныш", "Марат Мадина", "Мартенов Раймбек",
        "Махмутова Карина", "Медиубаева Сабира", "Мизамбеков Асанали", "Моминова Карина",
        "Нурланова Камила", "Омар Ақназ", "Орынбасар Нұрай", "Пак Лилия",
        "Ринаткызы Камилла", "Сеит Дастан", "Туребаев Даурен", "Урюпинский Максим",
        "Хусаинова Карина", "Цой Артем", "Шабалина Александра", "Шайхаеслям Аяна",
        "Шәріпқазы Дария", "Ямбаева Анна"
    ];

    // DOM
    const nameSelect = document.getElementById('nameSelect');
    const dateInput = document.getElementById('dateInput');
    const addBtn = document.getElementById('addBtn');
    const hereBtn = document.getElementById('hereBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const calendarGrid = document.getElementById('calendarGrid');
    const memberListContainer = document.getElementById('memberListContainer');
    const statsCounter = document.getElementById('statsCounter');
    const updateTime = document.getElementById('updateTime');
    const statusBadge = document.getElementById('statusBadge');
    const adminBtn = document.getElementById('adminBtn');
    const adminPanel = document.getElementById('adminPanel');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordConfirmBtn = document.getElementById('passwordConfirmBtn');
    const passwordCancelBtn = document.getElementById('passwordCancelBtn');
    const toast = document.getElementById('toast');

    let allMembers = [];
    let isAdmin = false;
    let toastTimeout = null;

    // ---------- ТОСТ ----------
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ---------- SELECT ----------
    function populateSelect() {
        nameSelect.innerHTML = '';
        const sorted = [...MEMBER_NAMES].sort((a,b) => a.localeCompare(b));
        sorted.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            nameSelect.appendChild(opt);
        });
    }

    // ---------- СТАТУС ----------
    function getStatus(dateStr) {
        if (dateStr === 'в городе') return 'green';
        const d = new Date(dateStr);
        if (isNaN(d)) return 'red';
        const month = d.getMonth();
        const day = d.getDate();
        if (month < 7) return 'yellow';
        if (month === 7 && day <= 30) return 'yellow';
        return 'red';
    }

    function getDateDisplay(dateStr) {
        if (dateStr === 'в городе') return '🏠 в городе';
        if (!dateStr) return '—';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;
    }

    // ---------- РЕНДЕР ----------
    function render() {
        // Календарь
        const start = new Date(2026, 7, 1);
        const end = new Date(2026, 8, 30);
        let html = '';
        const current = new Date(start);

        // Группируем участников по датам для tooltip
        const dateMap = {};
        allMembers.forEach(m => {
            if (m.date && m.date !== 'в городе') {
                if (!dateMap[m.date]) dateMap[m.date] = [];
                dateMap[m.date].push(m.name);
            }
        });

        while (current <= end) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            let cellClass = 'day-cell';
            const membersOnDate = allMembers.filter(m => m.date === dateStr);
            const count = membersOnDate.length;
            const names = dateMap[dateStr] || [];

            if (count > 0) {
                cellClass += ' has-event';
                const status = getStatus(dateStr);
                if (status === 'green') cellClass += ' green-bg';
                else if (status === 'yellow') cellClass += ' yellow-bg';
                else if (status === 'red') cellClass += ' red-bg';
            }

            // Строим tooltip
            let tooltipHtml = '';
            if (names.length > 0) {
                const namesList = names.map(n => `<div class="tooltip-name">${n}</div>`).join('');
                tooltipHtml = `
                    <div class="tooltip">
                        <div class="tooltip-title">📅 ${getDateDisplay(dateStr)}</div>
                        ${namesList}
                    </div>
                `;
            }

            html += `<div class="${cellClass}">
                <span class="date">${current.getDate()}</span>
                ${count > 0 ? `<span class="count">${count}</span>` : ''}
                ${tooltipHtml}
            </div>`;
            current.setDate(current.getDate() + 1);
        }
        calendarGrid.innerHTML = html;

        // Список участников
        if (allMembers.length === 0) {
            memberListContainer.innerHTML = `<div class="empty-message">Нет добавленных участников</div>`;
            statsCounter.textContent = '0 участников';
            return;
        }

        const sorted = [...allMembers].sort((a,b) => {
            if (a.date === 'в городе' && b.date !== 'в городе') return -1;
            if (b.date === 'в городе' && a.date !== 'в городе') return 1;
            if (a.date === 'в городе' && b.date === 'в городе') return a.name.localeCompare(b.name);
            return (a.date || '').localeCompare(b.date || '');
        });

        let listHtml = '';
        sorted.forEach(m => {
            const status = getStatus(m.date);
            listHtml += `<span class="member-tag ${isAdmin ? 'admin-mode' : ''}">
                <span class="status-dot ${status}"></span>
                ${m.name} · ${getDateDisplay(m.date)}
                ${isAdmin ? `<button class="delete-btn" data-name="${m.name}" title="Удалить">✕</button>` : ''}
            </span>`;
        });
        memberListContainer.innerHTML = listHtml;
        statsCounter.textContent = `${allMembers.length} участников`;
        updateTime.textContent = `🔄 ${new Date().toLocaleTimeString()}`;

        if (isAdmin) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteMember(btn.dataset.name));
            });
        }

        // Обновляем позицию tooltip при наведении
        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('mouseenter', function(e) {
                const tooltip = this.querySelector('.tooltip');
                if (tooltip) {
                    const rect = this.getBoundingClientRect();
                    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                    tooltip.style.top = (rect.top - tooltip.offsetHeight - 12) + 'px';
                    
                    // Проверяем, не выходит ли за экран
                    const tooltipRect = tooltip.getBoundingClientRect();
                    if (tooltipRect.left < 10) {
                        tooltip.style.left = '10px';
                    }
                    if (tooltipRect.right > window.innerWidth - 10) {
                        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
                    }
                    if (tooltipRect.top < 10) {
                        tooltip.style.top = (rect.bottom + 10) + 'px';
                        tooltip.querySelector('::after').style.bottom = 'auto';
                        tooltip.querySelector('::after').style.top = '-6px';
                        tooltip.querySelector('::after').style.borderTop = 'none';
                        tooltip.querySelector('::after').style.borderBottom = '6px solid #1e293b';
                    }
                }
            });
        });
    }

    // ---------- УДАЛЕНИЕ ----------
    async function deleteMember(name) {
        if (!isAdmin) return;
        if (!confirm(`Удалить участника "${name}"?`)) return;

        try {
            const response = await fetch(`${API_URL}/members/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(`✅ "${name}" удалён`);
                await loadData();
            } else {
                throw new Error(result.error || 'Ошибка удаления');
            }
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    // ---------- ЗАГРУЗКА ----------
    async function loadData() {
        try {
            statusBadge.textContent = '⏳ Загрузка...';
            statusBadge.className = 'status-badge loading';
            
            const response = await fetch(`${API_URL}/members`);
            const result = await response.json();
            
            if (result.success) {
                allMembers = result.data || [];
                statusBadge.textContent = '🟢 Онлайн';
                statusBadge.className = 'status-badge' + (isAdmin ? ' admin' : '');
            } else {
                throw new Error(result.error || 'Ошибка загрузки');
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            statusBadge.textContent = '🔴 Офлайн';
            statusBadge.className = 'status-badge offline';
        }
        render();
        updateAvailableNames();
    }

    // ---------- ОБНОВЛЕНИЕ ИМЁН ----------
    function updateAvailableNames() {
        const usedNames = allMembers.map(m => m.name);
        const available = MEMBER_NAMES.filter(n => !usedNames.includes(n));
        nameSelect.value = available.length > 0 ? available[0] : MEMBER_NAMES[0];
    }

    // ---------- ДОБАВЛЕНИЕ ----------
    async function addMemberWithDate(dateToStore, successMessage) {
        const name = nameSelect.value;
        if (!name) { alert('Выберите имя'); return false; }
        if (allMembers.some(m => m.name === name)) {
            alert(`"${name}" уже добавлен`);
            return false;
        }

        addBtn.disabled = hereBtn.disabled = true;
        addBtn.textContent = '⏳ Сохранение...';
        
        try {
            const response = await fetch(`${API_URL}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, date: dateToStore })
            });
            const result = await response.json();
            
            if (result.success) {
                dateInput.value = '';
                await loadData();
                showToast(successMessage || `✅ "${name}" добавлен`);
                return true;
            } else {
                throw new Error(result.error || 'Ошибка сохранения');
            }
        } catch (error) {
            alert('Ошибка: ' + error.message);
            return false;
        } finally {
            addBtn.textContent = '➕ Добавить';
            addBtn.disabled = hereBtn.disabled = false;
        }
    }

    async function addMember() {
        let dateValue = dateInput.value.trim();
        let dateToStore;
        if (!dateValue) {
            if (!confirm(`Установить "${nameSelect.value}" как "в городе"?`)) return;
            dateToStore = 'в городе';
        } else {
            const d = new Date(dateValue);
            if (isNaN(d)) return alert('Некорректная дата');
            const month = d.getMonth();
            if (d.getFullYear() !== 2026 || month < 7 || month > 8) {
                return alert('Дата должна быть с 1 августа по 30 сентября 2026');
            }
            dateToStore = dateValue;
        }
        await addMemberWithDate(dateToStore);
    }

    async function markAsHere() {
        const name = nameSelect.value;
        if (!name) { alert('Выберите имя'); return; }
        if (allMembers.some(m => m.name === name)) {
            alert(`"${name}" уже добавлен`);
            return;
        }
        await addMemberWithDate('в городе', `📍 "${name}" отметился в городе!`);
    }

    // ---------- АДМИН ----------
    function enterAdminMode() {
        isAdmin = true;
        statusBadge.className = 'status-badge admin';
        adminBtn.textContent = '🚪 Выйти';
        adminBtn.classList.add('active');
        adminPanel.classList.add('show');
        render();
    }

    function exitAdminMode() {
        isAdmin = false;
        statusBadge.className = 'status-badge';
        adminBtn.textContent = '🔑 Админ';
        adminBtn.classList.remove('active');
        adminPanel.classList.remove('show');
        render();
    }

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    function init() {
        populateSelect();
        const today = new Date();
        const defaultDate = (today >= new Date(2026, 7, 1) && today <= new Date(2026, 8, 30))
            ? today.toISOString().slice(0,10)
            : '2026-08-01';
        dateInput.value = defaultDate;

        loadData();

        addBtn.addEventListener('click', addMember);
        hereBtn.addEventListener('click', markAsHere);
        refreshBtn.addEventListener('click', loadData);
        dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addMember(); });
        
        adminBtn.addEventListener('click', () => {
            if (isAdmin) { exitAdminMode(); } else {
                passwordModal.classList.add('show');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        passwordConfirmBtn.addEventListener('click', () => {
            if (passwordInput.value === ADMIN_PASSWORD) {
                passwordModal.classList.remove('show');
                enterAdminMode();
            } else {
                alert('Неверный пароль!');
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        passwordCancelBtn.addEventListener('click', () => passwordModal.classList.remove('show'));
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') passwordConfirmBtn.click();
            if (e.key === 'Escape') passwordCancelBtn.click();
        });
        adminLogoutBtn.addEventListener('click', exitAdminMode);
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) passwordModal.classList.remove('show');
        });
        
        setInterval(loadData, 30000);
    }

    init();
</script>
</body>
</html>
