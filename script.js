"use strict";

// Load tasks from localStorage
let list = JSON.parse(localStorage.getItem("taskList")) || [];
let deactivatedList = JSON.parse(localStorage.getItem("deactivatedList")) || [];

// Display tasks on page load
document.addEventListener("DOMContentLoaded", () => {
  list.forEach(displayTask);
  deactivatedList.forEach(displayDeactivatedTask);
});

// Create Task Button Event
document.querySelector("#create").addEventListener("click", createTask);

// Reset List Buttons
document.querySelector("#resetList").addEventListener("click", resetList);
document.querySelector("#resetDeactivatedList").addEventListener("click", resetDeactivatedList);

// Print List Button Event
document.querySelector("#printList").addEventListener("click", printLists);

function createTask() {
  const title = document.querySelector("#createTitle").value;
  const quantity = document.querySelector("#createQuantity").value;
  const uuid = self.crypto.randomUUID();

  if (!title || !quantity) {
    alert("Please input name and/or quantity");
    return;
  }

  const task = { title, quantity, uuid };
  list.push(task);
  localStorage.setItem("taskList", JSON.stringify(list));

  displayTask(task);
  resetInputFields();
}

function displayTask(task) {
  const template = document.querySelector("template#tasks").content.cloneNode(true);
  const card = template.querySelector(".task-card");

  // Set task data on the card
  card.querySelector("[data-type=title] span").textContent = task.title;
  card.querySelector("[data-type=quantity] span").textContent = task.quantity;
  card.querySelector("[data-type=uuid] span").textContent = task.uuid;
  card.dataset.uuid = task.uuid;

  // Append the card to the active list section
  document.querySelector("#displayTask").appendChild(card);

  // Update number of items on list display
  updateArrayLength();
}

function displayDeactivatedTask(task) {
  const template = document.querySelector("template#tasks").content.cloneNode(true);
  const card = template.querySelector(".task-card");

  // Set task data on the card
  card.querySelector("[data-type=title] span").textContent = task.title;
  card.querySelector("[data-type=quantity] span").textContent = task.quantity;
  card.querySelector("[data-type=uuid] span").textContent = task.uuid;
  card.dataset.uuid = task.uuid;
  card.classList.add("deactivated");

  // Append the card to the deactivated list section
  document.querySelector("#deactivatedTask").appendChild(card);
}

function resetInputFields() {
  document.querySelector("#createTitle").value = "";
  document.querySelector("#createQuantity").value = "1";
}

// Event Delegation for Active and Deactivated Lists
document.querySelector("#displayTask").addEventListener("click", handleCardClick);
document.querySelector("#deactivatedTask").addEventListener("click", handleCardClick);

// Event delegation to handle clicks on the remove button
document.querySelector("#displayTask").addEventListener("click", function (event) {
  if (event.target.closest(".remove-button")) {
    event.stopPropagation(); // Prevent the card click event from firing
    removeItem(event, "active");
  }
});

document.querySelector("#deactivatedTask").addEventListener("click", function (event) {
  if (event.target.closest(".remove-button")) {
    event.stopPropagation(); // Prevent the card click event from firing
    removeItem(event, "deactivated");
  }
});

// Eventhandler HELP FROM CHATGPT
function handleCardClick(event) {
  const card = event.target.closest(".task-card");
  if (!card) return; // Ignore clicks outside of cards

  const uuid = card.dataset.uuid;
  const task = list.find((t) => t.uuid === uuid) || deactivatedList.find((t) => t.uuid === uuid);

  if (!task) return;

  if (card.classList.contains("deactivated")) {
    // Card is deactivated, re-add it to active list
    reAddTask(task);
  } else {
    // Card is active, deactivate it
    deactivateTask(task);
  }
  // Update number of items on list display
  updateArrayLength();
}

function deactivateTask(task) {
  // Add to deactivated list
  deactivatedList.push(task);
  localStorage.setItem("deactivatedList", JSON.stringify(deactivatedList));

  // Remove from active list
  list = list.filter((t) => t.uuid !== task.uuid);
  localStorage.setItem("taskList", JSON.stringify(list));

  // Remove the card from the active list display
  const card = document.querySelector(`.task-card[data-uuid="${task.uuid}"]`);
  if (card) {
    card.remove();
  }

  // Display the task in the deactivated section
  displayDeactivatedTask(task);
}

function reAddTask(task) {
  // Add to active list
  list.push(task);
  localStorage.setItem("taskList", JSON.stringify(list));

  // Remove from deactivated list
  deactivatedList = deactivatedList.filter((t) => t.uuid !== task.uuid);
  localStorage.setItem("deactivatedList", JSON.stringify(deactivatedList));

  // Remove the card from the deactivated list display
  const card = document.querySelector(`.task-card[data-uuid="${task.uuid}"]`);
  if (card) {
    card.remove();
  }

  // Display the task in the active section
  displayTask(task);
}

function removeItem(event) {
  const card = event.target.closest(".task-card");
  if (!card) return; // Ignore clicks outside of cards

  const uuid = card.dataset.uuid;

  // Remove the task from both active and deactivated lists
  list = list.filter((t) => t.uuid !== uuid);
  deactivatedList = deactivatedList.filter((t) => t.uuid !== uuid);

  // Update localStorage with the modified lists
  localStorage.setItem("taskList", JSON.stringify(list));
  localStorage.setItem("deactivatedList", JSON.stringify(deactivatedList));

  // Remove the card from the DOM
  card.remove();

  console.log(`Removed task with UUID: ${uuid} from all lists and DOM`);

  // Update number of items on list display
  updateArrayLength();
}

function resetList() {
  localStorage.removeItem("taskList");
  list = [];
  document.querySelector("#displayTask").innerHTML = "";
  console.log("Cleared list and storage");
}

function resetDeactivatedList() {
  localStorage.removeItem("deactivatedList");
  deactivatedList = [];
  document.querySelector("#deactivatedTask").innerHTML = "";
  console.log("Cleared deactivated list and storage");
}

function printLists() {
  const date = new Date();
  console.log("--------NEW LINE--------", date.toLocaleTimeString());
  console.log("Active list");
  console.table(list);
  console.log("Deactivated list");
  console.table(deactivatedList);
}
function updateArrayLength() {
  document.querySelector("#activeNumber span").textContent = list.length;
}
