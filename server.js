// server.js — API для АртХаус Календаря
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ НАСТРОЙКА CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
// ТЕСТОВЫЕ МАРШРУТЫ
// ============================================================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'АртХаус API работает!',
        endpoints: {
            GET: '/members',
            POST: '/members',
            DELETE: '/members/:name',
            DELETE_ALL: '/members',
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
            const { error: updateError } = await supabase
                .from('members')
                .update({ date: date || '' })
                .eq('name', name);
            
            if (updateError) throw updateError;
            res.json({ success: true, name, date, action: 'updated' });
        } else {
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

// 🗑️ DELETE: удалить ОДНОГО участника по имени (НОВЫЙ МАРШРУТ!)
app.delete('/members/:name', async (req, res) => {
    try {
        const name = req.params.name;
        console.log(`🗑️ DELETE /members/${name}`);
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Имя обязательно' });
        }
        
        // Проверяем, существует ли участник
        const { data: existing, error: findError } = await supabase
            .from('members')
            .select('name')
            .eq('name', name)
            .maybeSingle();
        
        if (findError && findError.code !== 'PGRST116') {
            console.error('❌ Ошибка поиска:', findError.message);
            throw findError;
        }
        
        if (!existing) {
            return res.status(404).json({ success: false, error: `Участник "${name}" не найден` });
        }
        
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('name', name);
        
        if (error) throw error;
        console.log(`✅ Участник "${name}" удалён`);
        res.json({ success: true, action: 'deleted', name });
    } catch (error) {
        console.error('❌ Ошибка удаления:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🗑️ DELETE: очистить ВСЕХ (если нужно)
app.delete('/members', async (req, res) => {
    try {
        console.log('🗑️ DELETE /members (очистка всех)');
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

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
