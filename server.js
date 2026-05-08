const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src')));

// In-memory data store
let data = {
  aeronaves: [
    { id: 1, nome: 'AERONAVE 1', modelo: 'KC-390', fabricante: 'EMBRAER', ano: 2025 },
    { id: 2, nome: 'AERONAVE 2', modelo: 'AIRBUS-737', fabricante: 'AIRBUS', ano: 2024 },
    { id: 3, nome: 'AERONAVE 3', modelo: 'BOEING-777', fabricante: 'BOEING', ano: 2023 },
  ],
  pecas: [],
  etapas: [],
  testes: []
};

// Routes - serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'src', 'dashboard.html')));
app.get('/pecas', (req, res) => res.sendFile(path.join(__dirname, 'src', 'pecas.html')));
app.get('/etapas', (req, res) => res.sendFile(path.join(__dirname, 'src', 'etapas.html')));
app.get('/testes', (req, res) => res.sendFile(path.join(__dirname, 'src', 'testes.html')));

// API routes
app.get('/api/aeronaves', (req, res) => {
  const { q } = req.query;
  if (q) {
    const filtered = data.aeronaves.filter(a =>
      a.nome.toLowerCase().includes(q.toLowerCase()) ||
      a.modelo.toLowerCase().includes(q.toLowerCase()) ||
      a.fabricante.toLowerCase().includes(q.toLowerCase())
    );
    return res.json(filtered);
  }
  res.json(data.aeronaves);
});

app.get('/api/aeronaves/:id', (req, res) => {
  const aeronave = data.aeronaves.find(a => a.id === parseInt(req.params.id));
  if (!aeronave) return res.status(404).json({ error: 'Aeronave não encontrada' });
  
  const etapas = data.etapas.filter(e => e.aeronaveId === aeronave.id);
  const pecasIds = etapas.flatMap(e => e.pecasIds || []);
  const pecas = data.pecas.filter(p => pecasIds.includes(p.id));
  
  res.json({ ...aeronave, etapas, pecas });
});

app.post('/api/pecas', (req, res) => {
  const { nome, fabricante, status } = req.body;
  const nova = { id: Date.now(), nome, fabricante, status: status || 'EM PRODUÇÃO' };
  data.pecas.push(nova);
  res.json(nova);
});

app.get('/api/pecas', (req, res) => res.json(data.pecas));

app.post('/api/etapas', (req, res) => {
  const { nome, aeronaveId, status } = req.body;
  const nova = { id: Date.now(), nome, aeronaveId: parseInt(aeronaveId), status: status || 'EM ANDAMENTO', pecasIds: [] };
  data.etapas.push(nova);
  res.json(nova);
});

app.get('/api/etapas', (req, res) => res.json(data.etapas));

app.post('/api/testes', (req, res) => {
  const { nome, tipo, status } = req.body;
  const novo = { id: Date.now(), nome, tipo, status: status || 'EM ANDAMENTO' };
  data.testes.push(novo);
  res.json(novo);
});

app.get('/api/testes', (req, res) => res.json(data.testes));

app.listen(PORT, () => console.log(`AeroCode rodando em http://localhost:${PORT}`));
