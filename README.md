# 🛒 Carrinho — Lista de Compras

App de lista de compras com PWA (instalável no celular), modo offline e comparação de preços.

---

## ▶️ Como rodar localmente

Você precisa de qualquer servidor HTTP local. Escolha um dos métodos abaixo:

### Opção 1 — Python (já vem instalado no Mac/Linux)
```bash
cd carrinho
python3 -m http.server 3000
```
Abra: http://localhost:3000

### Opção 2 — Node.js (npx, sem instalar nada)
```bash
cd carrinho
npx serve .
```
Abra o endereço que aparecer no terminal.

### Opção 3 — VS Code
Instale a extensão **Live Server**, clique com botão direito em `index.html` → "Open with Live Server".

### Opção 4 — PHP
```bash
cd carrinho
php -S localhost:3000
```

> ⚠️ Não abra o `index.html` direto pelo explorador de arquivos (file://...) — o Service Worker não funciona sem um servidor HTTP.

---

## 📱 Instalar no celular (PWA)

### Android (Chrome/Edge)
1. Acesse o site no celular (veja "Publicar online" abaixo)
2. Um banner aparece automaticamente: toque em **Instalar**
3. Ou: menu (⋮) → "Adicionar à tela inicial"

### iPhone (Safari)
1. Acesse o site no Safari
2. Toque no ícone de compartilhar (caixa com seta)
3. "Adicionar à Tela Inicial"
4. Pronto! O app fica igual a um app nativo

---

## 🌐 Publicar online (para compartilhar com a família)

### Opção 1 — GitHub Pages (gratuito, mais fácil)
1. Crie uma conta em github.com
2. Crie um repositório público
3. Faça upload dos arquivos
4. Vá em Settings → Pages → Branch: main → Save
5. Seu link: `https://seu-usuario.github.io/carrinho`

### Opção 2 — Netlify (gratuito, drag & drop)
1. Acesse netlify.com → faça login
2. Arraste a pasta `carrinho` para a área indicada
3. Receba um link público imediatamente
4. Ex: `https://meu-carrinho.netlify.app`

### Opção 3 — Vercel (gratuito)
```bash
npm install -g vercel
cd carrinho
vercel
```

---

## 👨‍👩‍👧 Compartilhar com a família

**Modo simples (sem backend):**
- Suba o app em qualquer um dos serviços acima
- Compartilhe o link com a família
- Cada pessoa tem sua própria lista (salva no celular)
- Use o botão 📤 para enviar a lista por WhatsApp/Telegram

**Modo colaborativo em tempo real (lista compartilhada):**
- Integre com Firebase ou Supabase (banco de dados em nuvem)
- Permite que família edite a MESMA lista simultaneamente
- Requer conta no Firebase (gratuito até certo limite)

---

## 📁 Estrutura do projeto

```
carrinho/
├── index.html      # Estrutura da página
├── style.css       # Estilos e temas (claro/escuro)
├── app.js          # Toda a lógica do app
├── sw.js           # Service Worker (modo offline)
├── manifest.json   # Configuração PWA
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## ✨ Funcionalidades

- ✅ Adicionar produtos com quantidade, unidade e preço
- ✅ Categorias (Hortifruti, Carnes, Bebidas, etc.)
- ✅ Marcar como comprado (move para o final)
- ✅ Barra de progresso
- ✅ Resumo de gastos (estimado / comprado / restante)
- ✅ Favoritos e adição rápida com 1 clique
- ✅ Busca em tempo real
- ✅ Histórico de listas (salvar e reutilizar)
- ✅ Comparação de preços por mercado
- ✅ Compartilhar lista por WhatsApp/Telegram
- ✅ Tema escuro
- ✅ Modo offline (Service Worker)
- ✅ Instalável como app (PWA)
- ✅ Dados salvos no dispositivo (localStorage)
