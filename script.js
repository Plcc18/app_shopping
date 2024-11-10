const form = document.querySelector("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const footer = document.querySelector("footer");
const iconDelete = document.getElementById("delete");
const alertMessage = document.getElementById("alertMessage");

// Função para salvar a lista atual no localStorage, incluindo o estado dos checkboxes
const saveList = () => {
  const items = [];
  list.querySelectorAll("li").forEach(li => {
    const text = li.querySelector("p").textContent;
    const isChecked = li.querySelector("input[type='checkbox']").checked;
    items.push({ text, isChecked });
  });
  localStorage.setItem("shoppingList", JSON.stringify(items));
};

// Função para carregar a lista do localStorage, restaurando o estado dos checkboxes
const loadList = () => {
  const savedList = JSON.parse(localStorage.getItem("shoppingList")) || [];
  savedList.forEach(item => addItem(item.text, item.isChecked));
};

// Adiciona o item à lista, define o estado do checkbox e salva no localStorage
const addItem = (newItem, isChecked = false) => {
  const newLi = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("styled-checkbox");
  checkbox.checked = isChecked; // Define o estado inicial do checkbox

  const label = document.createElement("label");
  label.classList.add("checkbox-label");

  const span = document.createElement("span");

  const p = document.createElement("p");
  p.textContent = newItem;
  
  // Aplica o estilo riscado e opaco se o item estiver marcado
  if (isChecked) {
    p.style.textDecoration = "line-through";
    p.style.opacity = "0.3";
  }

  label.appendChild(span);
  label.appendChild(p);

  const icon = document.createElement("ion-icon");
  icon.name = "trash-outline";

  icon.addEventListener("click", () => {
    list.removeChild(newLi);
    showAlert(`O item "${newItem}" foi removido da lista`);
    saveList(); // Salva a lista após remover um item
  });

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      p.style.textDecoration = "line-through";
      p.style.opacity = "0.3";
    } else {
      p.style.textDecoration = "none";
      p.style.opacity = "1";
    }
    saveList(); // Salva o estado do checkbox ao marcar/desmarcar
  });

  newLi.appendChild(checkbox);
  newLi.appendChild(label);
  newLi.appendChild(icon);

  list.appendChild(newLi);

  saveList(); // Salva a lista após adicionar um item

  input.value = "";
};

// Exibe mensagem de alerta
const showAlert = (message) => {
  alertMessage.textContent = message;
  footer.hidden = false;
};

// Fecha o alerta ao clicar no ícone de exclusão
iconDelete.addEventListener("click", () => {
  footer.hidden = true;
});

// Carrega a lista ao abrir o app
window.addEventListener("load", loadList);

form.onsubmit = (event) => {
  event.preventDefault();
  const newItem = input.value.trim();
  if (newItem === "") {
    showAlert("Por favor, insira um item a lista!");
    return;
  }
  addItem(newItem);
};

// Service Worker para funcionalidades offline (caso necessário)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app_shopping/service-worker.js')
      .then(registration => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch(error => {
        console.log("Falha ao registrar o Service Worker:", error);
      });
  });
}
