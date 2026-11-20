'use client';
import { useState, useEffect, useMemo } from 'react';
import './page.css';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const MAX_FOODS = 10;
const STORAGE_KEY = 'meriendas';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState('');
  const [schedules, setSchedules] = useState({});
  const [editingFood, setEditingFood] = useState(null);
  const [editName, setEditName] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Cargar datos guardados (protegido contra datos corruptos)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setFoods(Array.isArray(data.foods) ? data.foods : []);
        setSchedules(data.schedules && typeof data.schedules === 'object' ? data.schedules : {});
      }
    } catch {
      // datos corruptos o localStorage bloqueado: empezamos de cero
    }
    setLoaded(true);
  }, []);

  // Guardar siempre tras la carga inicial (incluido cuando la lista queda vacía)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foods, schedules }));
    } catch {
      // sin espacio o almacenamiento bloqueado
    }
  }, [foods, schedules, loaded]);

  const addFood = () => {
    const name = newFood.trim();
    if (!name || foods.length >= MAX_FOODS) return;
    if (foods.some(f => f.name.toLowerCase() === name.toLowerCase())) return;
    setFoods(prev => [...prev, { id: Date.now() + Math.random(), name }]);
    setNewFood('');
  };

  const deleteFood = (id) => {
    setFoods(prev => prev.filter(f => f.id !== id));
    setSchedules(prev => {
      const next = {};
      for (const day of days) {
        if (prev[day]) next[day] = prev[day].filter(fid => fid !== id);
      }
      return next;
    });
    if (editingFood === id) setEditingFood(null);
  };

  const startEdit = (id, name) => {
    setEditingFood(id);
    setEditName(name);
  };

  const saveEdit = () => {
    const name = editName.trim();
    if (name) {
      setFoods(prev => prev.map(f => (f.id === editingFood ? { ...f, name } : f)));
    }
    setEditingFood(null);
  };

  const toggleSnack = (day, foodId) => {
    setSchedules(prev => {
      const current = prev[day] || [];
      return {
        ...prev,
        [day]: current.includes(foodId) ? current.filter(id => id !== foodId) : [...current, foodId],
      };
    });
  };

  // Calculada una sola vez por cambio, no en cada render
  const shoppingList = useMemo(() => {
    const byId = new Map(foods.map(f => [f.id, f.name]));
    const list = new Set();
    for (const day of days) {
      for (const foodId of schedules[day] || []) {
        const name = byId.get(foodId);
        if (name) list.add(name);
      }
    }
    return Array.from(list);
  }, [foods, schedules]);

  const full = foods.length >= MAX_FOODS;

  return (
    <div className="container">
      <h1>🍎 Planificador de Meriendas</h1>

      <div className="panel">
        <h2>Agregar Alimentos</h2>
        <div className="input-group">
          <input
            value={newFood}
            onChange={(e) => setNewFood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFood()}
            placeholder="Nombre del alimento"
            disabled={full}
          />
          <button onClick={addFood} disabled={full || !newFood.trim()}>
            Agregar ({foods.length}/{MAX_FOODS})
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Alimentos Disponibles</h2>
        <div className="food-list">
          {foods.map(food => (
            <div key={food.id} className="food-item">
              {editingFood === food.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingFood(null);
                  }}
                  autoFocus
                />
              ) : (
                <span>{food.name}</span>
              )}
              <div>
                {editingFood === food.id ? (
                  <button className="btn-save" onClick={saveEdit}>Guardar</button>
                ) : (
                  <button className="btn-edit" aria-label={`Editar ${food.name}`} onClick={() => startEdit(food.id, food.name)}>✏️</button>
                )}
                <button className="btn-delete" aria-label={`Borrar ${food.name}`} onClick={() => deleteFood(food.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Plan de Meriendas (5 días)</h2>
        <div className="schedule">
          {days.map(day => (
            <div key={day} className="day-column">
              <h3>{day}</h3>
              <div className="day-snacks">
                {foods.map(food => (
                  <label key={`${day}-${food.id}`} className="snack-checkbox">
                    <input
                      type="checkbox"
                      checked={(schedules[day] || []).includes(food.id)}
                      onChange={() => toggleSnack(day, food.id)}
                    />
                    {food.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>📋 Lista de Compra</h2>
        <div className="shopping-list">
          {shoppingList.length > 0 ? (
            <ul>
              {shoppingList.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Selecciona meriendas para generar la lista de compra</p>
          )}
        </div>
      </div>
    </div>
  );
}
