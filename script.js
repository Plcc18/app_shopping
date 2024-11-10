const form = document.querySelector("form")
const input = document.getElementById("input")
const list = document.getElementById("list")
const footer = document.querySelector("footer")
const iconDelete = document.getElementById("delete")
const alertMessage = document.getElementById("alertMessage")

form.onsubmit = (event) => {
  event.preventDefault()
  const newItem = input.value.trim()
  if(newItem === "") {
    showAlert("Por favor, insira um item a lista!")
    return;
  }
  addItem(newItem)
}

const addItem = (newItem) => {
  const newLi = document.createElement("li")

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.classList.add("styled-checkbox")

  const label = document.createElement("label")
  label.classList.add("checkbox-label")

  const span = document.createElement("span")

  const p = document.createElement("p")
  p.textContent = newItem

  label.appendChild(span)
  label.appendChild(p)
  
  const icon = document.createElement("ion-icon")
  icon.name = "trash-outline"

  icon.addEventListener("click", () => {
    list.removeChild(newLi)
    showAlert(`O item "${newItem}" foi removido da lista`)
  })

  checkbox.addEventListener("change", () => {
    if(checkbox.checked) {
      p.style.textDecoration = "line-through"
      p.style.opacity = "0.3"
    }else {
      p.style.textDecoration = "none"
      p.style.opacity = "1"
    }
  })
  
  newLi.appendChild(checkbox)
  newLi.appendChild(label)
  newLi.appendChild(icon)
  
  list.appendChild(newLi)
  
  input.value = ""
}

const showAlert = (message) => {
  alertMessage.textContent = message
  footer.hidden = false
}

iconDelete.addEventListener("click", () => {
  footer.hidden = true
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch(error => {
        console.log("Falha ao registrar o Service Worker:", error);
      });
  });
}
