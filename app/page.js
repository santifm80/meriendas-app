'use client';
import {useState, useEffect} from 'react';
import './page.css';

const days=['Lunes','Martes','Miércoles','Jueves','Viernes'];

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState('');
  const [schedules, setSchedules] = useState({});
  const [editingFood, setEditingFood] = useState(null);
  const [editName, setEditName] = useState('');

useEffect(() => {
  const stored = localStorage.getItem('meriendas');
  if (stored) {
    const data = JSON.parse(stored);
    setFoods(data.foods || []);
    setSchedules(data.schedules || {});
  }
}, []);

useEffect(() => {
  if (foods.length > 0) {
    localStorage.setItem('meriendas', JSON.stringify({foods,schedules}));
  }
}, [foods, schedules]);

const addFood = () => {
  if (newFood.trim() && foods.length < 10) {
    const id = Date.now();
    setFoods([...foods, {id, name: newFood}]);
    setNewFood('');
  }
};

const deleteFood = (id) => {
  setFoods(foods.filter(f => f.id !== id));
  const newSchedules = {...schedules};
  days.forEach(day => {
    if (newSchedules[day]) {
      newSchedules[day] = newSchedules[day].filter(fid => fid !== id);
    }
  });
  setSchedules(newSchedules);
};

const startEdit = (id, name) => {
  setEditingFood(id);
  setEditName(name);
};

const saveEdit = () => {
  setFoods(foods.map(f => f.id === editingFood ? {...f, name: editName} : f));
  setEditingFood(null);
};

const toggleSnack = (day, foodId) => {
  setSchedules(prev => {
    const current = prev[day] || [];
    return {
      ...prev,
      [day]: current.includes(foodId) ? current.filter(id => id !== foodId) : [...current, foodId]
    };
  });
};

const getShoppingList = () => {
  const list = new Set();
  days.forEach(day => {
    (schedules[day] || []).forEach(foodId => {
      const food = foods.find(f => f.id === foodId);
      if (food) list.add(food.name);
    });
  });
  return Array.from(list);
};

return (
  <div className="container">
  <h1>🍎 Planificador de Meriendas</h1>

<div className="panel">
  <h2>Agregar Alimentos</h2>
  <div className="input-group">
  <input value={newFood} onChange={(e) => setNewFood(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addFood()} placeholder="Nombre del alimento" disabled={foods.length >= 10} />
<button onClick={addFood} disabled={foods.length >= 10}>Agregar ({foods.length}/10)</button>
  </div>
  </div>

<div className="panel">
  <h2>Alimentos Disponibles</h2>
<div className="food-list">
{foods.map(food => (
  <div key={food.id} className="food-item">
  {editingFood === food.id ? (<input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && saveEdit()} autoFocus />) : (<span>{food.name}</span>)}
   <div>
                                                                                                                 {editingFood === food.id ? (<button className="btn-save" onClick={saveEdit}>Guardar</button>) : (<button className="btn-edit" onClick={() => startEdit(food.id, food.name)}>✏️</button>)}
  <button className="btn-delete" onClick={() => deleteFood(food.id)}>🗑️</button>
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
  <input type="checkbox" checked={(schedules[day] || []).includes(food.id)} onChange={() => toggleSnack(day, food.id)} />
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
  {getShoppingList().length > 0 ? (
                                    <ul>
{getShoppingList().map((item, idx) => (
                                                                 <li key={idx}>• {item}</li>
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
