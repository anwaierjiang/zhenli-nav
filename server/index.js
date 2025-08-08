// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');   // ✅ 只保留这一处
const multer = require('multer'); // ✅ 上传用

const app = express();
const PORT = 4000;

// 启用 CORS
app.use(cors());

// 读取工具数据
const toolsFile = path.join(__dirname, 'tools.json');
let tools = [];
if (fs.existsSync(toolsFile)) {
  tools = JSON.parse(fs.readFileSync(toolsFile, 'utf-8'));
} else {
  fs.writeFileSync(toolsFile, JSON.stringify(tools));
}

// 获取工具列表
app.get('/api/tools', (req, res) => {
  res.json(tools);
});

// 添加新工具
app.post('/api/admin/tools', express.json(), (req, res) => {
  const newTool = {
    id: tools.length > 0 ? tools[tools.length - 1].id + 1 : 1,
    ...req.body
  };
  tools.push(newTool);
  fs.writeFileSync(toolsFile, JSON.stringify(tools, null, 2));
  res.json(newTool);
});

// 删除工具
app.delete('/api/admin/tools/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tools = tools.filter(tool => tool.id !== id);
  fs.writeFileSync(toolsFile, JSON.stringify(tools, null, 2));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// 上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 静态托管上传目录
app.use('/uploads', express.static(uploadDir));

// 配置 multer：按日期命名，避免重名
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// 上传接口
app.post('/api/upload', upload.single('icon'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  // 返回可访问的 URL
  const url = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url });
});