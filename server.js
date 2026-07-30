// server.js — API для АртХаус Календаря
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ НАСТРОЙКА CORS — МАКСИМАЛЬНО РАЗРЕШАЮЩАЯ
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Обработка preflight запросов
app.options('*', cors());

app.use(express.json());

// ============================================================
// НАСТРОЙКА SUPABASE
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔍 Проверка переменных:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ установлен' : '❌ ОТСУТСТВУЕТ');
console.log('SUPABASE_KEY:', supabaseKey ? '✅ установлен' : '❌ ОТСУТСТВУЕТ');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения не заданы!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// ТЕСТОВЫЙ МАРШРУТ (для проверки, что сервер работает)
// ============================================================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'АртХаус API работает!',
        endpoints: {
            GET: '/members',
            POST: '/members',
            DELETE: '/members',
            health: '/health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// ОСНОВНЫЕ МАРШРУТЫ
// ============================================================

// 📥 GET: получить всех участников
app.get('/members', async (req, res) => {
    try {
        console.log('📥 GET /members');
        const { data, error } = await supabase
            .from('members')
            .select('name, date')
            .order('name');
        
        if (error) {
            console.error('❌ Ошибка Supabase:', error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
        
        console.log(`✅ Найдено ${data?.length || 0} участников`);
        res.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📤 POST: добавить участника
app.post('/members', async (req, res) => {
    try {
        const { name, date } = req.body;
        console.log(`📤 POST /members: ${name}, ${date}`);
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Имя обязательно' });
        }
        
        // Проверяем, есть ли уже такой участник
        const { data: existing, error: findError } = await supabase
            .from('members')
            .select('name')
            .eq('name', name)
            .maybeSingle();
        
        if (findError && findError.code !== 'PGRST116') {
            console.error('❌ Ошибка поиска:', findError.message);
            throw findError;
        }
        
        if (existing) {
            // Обновляем дату
            const { error: updateError } = await supabase
                .from('members')
                .update({ date: date || '' })
                .eq('name', name);
            
            if (updateError) throw updateError;
            res.json({ success: true, name, date, action: 'updated' });
        } else {
            // Добавляем нового
            const { error: insertError } = await supabase
                .from('members')
                .insert({ name, date: date || '' });
            
            if (insertError) throw insertError;
            res.json({ success: true, name, date, action: 'added' });
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🗑️ DELETE: очистить всех
app.delete('/members', async (req, res) => {
    try {
        console.log('🗑️ DELETE /members');
        const { error } = await supabase
            .from('members')
            .delete()
            .neq('id', 0);
        
        if (error) throw error;
        res.json({ success: true, action: 'cleared' });
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// ЗАПУСК СЕРВЕРА
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Откройте: https://arthouse-api.onrender.com`);
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
