const addTransactionButton = document.querySelector(".add-transaction");
const modal = document.querySelector(".modal");
const modalOverlay = document.querySelector(".modal-overlay");
const modalForm = document.getElementById("modal-form");
const transactionsList = document.getElementById("transactions-list");
const incomeDisplay = document.getElementById("income-display");
const expenseDisplay = document.getElementById("expense-display");
const totalDisplay = document.getElementById("total-display");
const transactionTypeButtons = document.querySelectorAll(
  ".transaction-type-button"
);
let selectedTransactionType = null;
const closeButton = document.querySelector(".close-button");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const dateInput = document.getElementById("date");

const transactions = [];
var updateModalId = null;

function saveTransactionsToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Botões do tipo de transação (Entrada ou Saída)
transactionTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTransactionType = button.getAttribute("data-type");
    // Adicione classe de destaque ao botão selecionado para fornecer feedback visual
    transactionTypeButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

// Função para formatar a data no padrão brasileiro
function formatDateToBR(dateString) {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

// fn para conveter o número corretamente

function formatCurrency(number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

async function listarTransacoes() {
  try {
    const response = await axios.get("http://localhost:8080/transactions", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Erro ao listar transações");
  }
}

// Função para cadastrar uma transação no banco de dados (chamar back-end)
async function cadastrar(transaction) {
  try {
    await axios.post("http://localhost:8080/transactions", transaction, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new Error("Erro ao cadastrar transação");
  }
}

async function atualizar(transaction) {
  try {
    await axios.put(
      `http://localhost:8080/transactions/${transaction.id}`,
      transaction,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw new Error("Erro ao atualizar transação");
  }
}

async function deletar(id) {
  try {
    await axios.delete(`http://localhost:8080/transactions/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new Error("Erro ao deletar transação");
  }
}

// Formata o ano corretamente no input de data
dateInput.addEventListener("input", (e) => {
  let value = e.target.value;
  let parts = value.split("T")[0].split("-");
  if (parts[0].length > 4) {
    parts[0] = parts[0].substring(0, 4);
    value = parts.join("-");
    e.target.value = value;
  }
});

// Botão para adicionar uma transação
addTransactionButton.addEventListener("click", () => {
  document.querySelector("html").dataset.isModalOpen = true;
  modalOverlay.style.display = "block";
  modal.style.display = "block";
});

closeButton.addEventListener("click", () => {
  closeModal();
  console.log(updateModalId);
});

function closeModal() {
  document.querySelector("html").dataset.isModalOpen = false;
  modalOverlay.style.display = "none";
  modal.style.display = "none";

  // Limpa o formulário
  modalForm.reset();
  selectedTransactionType = null;
  transactionTypeButtons.forEach((btn) => btn.classList.remove("selected"));

  // Limpa o ID do modal de atualizar
  updateModalId = null;

  // Muda o nome do botão pra "Cadastrar"
  document.querySelector(".save-button").textContent = "Cadastrar";
}

// Adiciona uma transação através do formulário
modalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = selectedTransactionType;

  if (category === "0" || !category) {
    return alert("Por favor, selecione uma categoria.");
  }

  if (!selectedTransactionType) {
    return alert(
      'Por favor, selecione "Entrada" ou "Saída" antes de submeter.'
    );
  }

  if (!description.trim() || isNaN(amount) || !selectedTransactionType) {
    return alert("Por favor, preencha todos os campos corretamente.");
  }

  const transaction = {
    id: updateModalId ?? Date.now(),
    description: description.trim(),
    amount: selectedTransactionType === "expense" ? -amount : amount,
    created_at: new Date(dateInput.value),
    type,
    category,
  };

  try {
    // Se o ID do modal de atualizar estiver preenchido, atualize a transação
    if (updateModalId) {
      await atualizar(transaction);
      const index = transactions.findIndex((t) => t.id == transaction.id);
      transactions.splice(index, 1, {
        ...transaction,
        created_at: transaction.created_at.toISOString(),
      });

      saveTransactionsToLocalStorage();
      updateTransactionsList();
      updateSummary();
      closeModal();
      return;
    }

    // Tente cadastrar a transação no back-end
    await cadastrar(transaction);
    // Se bem-sucedido, atualize o front-end:
    transactions.push({
      ...transaction,
      created_at: transaction.created_at.toISOString(),
    });
    saveTransactionsToLocalStorage();
    updateTransactionsList();
    updateSummary();
    closeModal();
  } catch (error) {
    // Se falhar, mostre um erro e não atualize o front-end
    alert(error.message);
    return;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const result = await listarTransacoes();
    const transactionList = result["_embedded"]["transactions"];
    transactions.push(
      ...transactionList.map((t) => ({
        id: t["_links"]["self"]["href"].split("/").pop(),
        description: t["description"],
        amount: t["amount"],
        created_at: t["created_at"],
        type: t["type"],
        category: t["category"],
      }))
    );
    saveTransactionsToLocalStorage();

    updateTransactionsList();
    updateSummary();
  } catch (error) {
    alert(error.message);
  }
});

// Atualiza a lista de transações na UI
function updateTransactionsList() {
  const transactionsListHTML = transactions.map((transaction) => {
    return `
                        <li class="transaction ${
                          transaction.amount >= 0 ? "entrada" : "saida"
                        }">
                                <span class="transaction-text">${
                                  transaction.description
                                }</span>
                                <span class="transaction-amount">${
                                  transaction.amount >= 0
                                    ? `${formatCurrency(
                                        transaction.amount.toFixed(2)
                                      )}`
                                    : `-${formatCurrency(
                                        Math.abs(transaction.amount).toFixed(2)
                                      )}`
                                }</span>
                                <span class="transaction-category">${
                                  transaction.category
                                }</span>
                                <span class="transaction-data">${formatDateToBR(
                                  transaction.created_at
                                )}</span>
                                <span class="transaction-operation">
                                <button class="update-button" data-id="${
                                  transaction.id
                                }"><i class="ph ph-pencil-simple"></i></button>
                                <button class="delete-button" data-id="${
                                  transaction.id
                                }"><i class="ph ph-trash"></i></button>
                                </span>
                        </li>
                `;
  });
  transactionsList.innerHTML = transactionsListHTML.join("");
  attachDeleteListeners(); // Botões de excluir
  attachUpdateListeners(); // Botões de atualizar
}

// Botões de atualizar
function attachUpdateListeners() {
  const updateButtons = document.querySelectorAll(".update-button");
  updateButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Preenche o formulário com os dados da transação
      updateModalId = parseInt(
        e.target.closest(".update-button").getAttribute("data-id")
      );

      const transaction = transactions.find((t) => t.id == updateModalId);

      document.getElementById("description").value = transaction.description;
      document.getElementById("amount").value = Math.abs(transaction.amount);
      document.getElementById("category").value = transaction.category;
      document.getElementById("date").value =
        transaction.created_at.split("T")[0];

      console.log(transaction);
      // Seleciona o tipo de transação
      if (transaction.amount >= 0) {
        transactionTypeButtons[0].classList.add("selected");
        transactionTypeButtons[1].classList.remove("selected");
        selectedTransactionType = "income";
      } else {
        transactionTypeButtons[1].classList.add("selected");
        transactionTypeButtons[0].classList.remove("selected");
        selectedTransactionType = "expense";
      }

      // Mudar o nome do botão pra "Atualizar"
      document.querySelector(".save-button").textContent = "Atualizar";

      // Abre a modal
      document.querySelector("html").dataset.isModalOpen = true;
      modalOverlay.style.display = "block";
      modal.style.display = "block";
    });
  });
}

// Botões de excluir
function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = parseInt(
        e.target.closest(".delete-button").getAttribute("data-id")
      );
      try {
        deleteTransactionById(id);
        await deletar(id);
      } catch (error) {
        alert(error.message);
        return;
      }
    });
  });
}

// Deleta uma transação pelo ID
function deleteTransactionById(id) {
  const index = transactions.findIndex((t) => t.id == id);
  if (index !== -1) {
    transactions.splice(index, 1);
  }

  saveTransactionsToLocalStorage();

  updateTransactionsList();
  updateSummary();
}

// Atualiza o resumo financeiro (Entradas, Saídas e Total)
function updateSummary() {
  const income = transactions
    .filter((transaction) => transaction.amount >= 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const total = income + expense;

  incomeDisplay.textContent = `${formatCurrency(income.toFixed(2))}`;
  expenseDisplay.textContent = `-${formatCurrency(
    Math.abs(expense).toFixed(2)
  )}`;
  totalDisplay.textContent = `${formatCurrency(total.toFixed(2))}`;
}

// Filtra as transações baseado no input de busca
function filterTransactions() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    displayTransactions(transactions);
    return;
  }
  const filteredTransactions = transactions.filter((transaction) => {
    return transaction.description.toLowerCase().includes(query);
  });
  displayTransactions(filteredTransactions);
}

// Exibe as transações filtradas na UI
function displayTransactions(transactionsToDisplay) {
  const transactionsListHTML = transactionsToDisplay.map((transaction) => {
    return `
                        <li class="transaction ${
                          transaction.amount >= 0 ? "income" : "expense"
                        }">
                                <span class="transaction-text">${
                                  transaction.text
                                }</span>
                                <span class="transaction-amount">${
                                  transaction.amount >= 0
                                    ? `${formatCurrency(
                                        transaction.amount.toFixed(2)
                                      )}`
                                    : `-${formatCurrency(
                                        Math.abs(transaction.amount).toFixed(2)
                                      )}`
                                }</span>
                                <span class="transaction-category">${
                                  transaction.category
                                }</span>
                                <span class="transaction-data">${formatDateToBR(
                                  transaction.created_at
                                )}</span>
                                <button class="update-button" data-id="${
                                  transaction.id
                                }"><i class="ph ph-pencil-simple"></i></button>
                                <button class="delete-button" data-id="${
                                  transaction.id
                                }"><i class="ph ph-trash"></i></button>
                        </li>
                `;
  });
  transactionsList.innerHTML = transactionsListHTML.join("");
  attachDeleteListeners(); // Adiciona listeners aos botões de excluir
}

// Pesquisa
searchButton.addEventListener("click", filterTransactions);
searchInput.addEventListener("input", function () {
  if (!searchInput.value.trim()) {
    displayTransactions(transactions);
  }
});

searchInput.addEventListener("keyup", function (event) {
  // Pra funcionar o Enter na busca
  if (event.key === "Enter") {
    filterTransactions();
  }
});

updateTransactionsList();
updateSummary();
