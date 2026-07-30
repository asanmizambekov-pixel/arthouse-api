// server.js — API для АртХаус Календаря
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройки CORS (разрешаем запросы с любых сайтов)
app.use(cors());
app.use(express.json());

// ============================================================
// Настройка Supabase
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// API ЭНДПОИНТЫ
// ============================================================

// 📥 GET: получить всех участников
app.get('/api/members', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('name, date')
            .order('name');
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📤 POST: добавить участника
app.post('/api/members', async (req, res) => {
    try {
        const { name, date } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: 'Имя обязательно' });
        }
        
        // Проверяем, есть ли уже такой участник
        const { data: existing, error: findError } = await supabase
            .from('members')
            .select('name')
            .eq('name', name)
            .maybeSingle();
        
        if (findError && findError.code !== 'PGRST116') throw findError;
        
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🗑️ DELETE: очистить всех
app.delete('/api/members', async (req, res) => {
    try {
        const { error } = await supabase
            .from('members')
            .delete()
            .neq('id', 0); // удаляем все записи
        
        if (error) throw error;
        res.json({ success: true, action: 'cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🏥 Проверка здоровья
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});