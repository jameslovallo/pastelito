// airtable stuff

const api = "https://api.airtable.com/v0";
const base = "appf19wrYG1YPJv8u";
const token =
  "patUED7XMxFnHAeuv.a8c6ecafc557d00587a247e0d38b82044feb8af68758c5d632ac2109659c098d";

const getRecords = (table, id = "") =>
  fetch(`${api}/${base}/${table + (id ? "/" + id : "")}?view=Grid%20view`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());

const updateRecord = (table, id, fields) =>
  fetch(`${api}/${base}/${table}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  }).then((res) => res.json());

const deleteRecord = (table, id) =>
  fetch(`${api}/${base}/${table}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

const createRecord = (table, fields) =>
  fetch(`${api}/${base}/${table}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  }).then((res) => res.json());

// top

const tokenCount = document.querySelector("#token-count");
const punishmentCount = document.querySelector("#punishment-count");
const accountTable = "tblVI2K5NPYjuqGHM";

const getAccount = async () => {
  const { records } = await getRecords(accountTable);
  const id = records[0].id;
  const { Tokens, Punishments } = records[0].fields;
  tokenCount.innerHTML = Tokens;
  punishmentCount.innerHTML = Punishments;
  return { id, Tokens, Punishments };
};

getAccount();

const updateTokens = async (v) => {
  const { id, Tokens: tokens, Punishments } = await getAccount();
  const Tokens = tokens + v;
  updateRecord(accountTable, id, { Tokens }).then(() => getAccount());
};

// tab stuff

const main = document.querySelector("main");
const footer = document.querySelector("footer");

window.addEventListener("load", () => {
  main.scrollTo({ left: main.clientWidth });
});

const views = document.querySelectorAll("main > div");
const tabs = document.querySelectorAll("footer > button");

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => {
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    tab.classList.add("active");
    main.scrollTo({ left: main.clientWidth * i, behavior: "smooth" });
  });
});

// habits

const habitsTable = "tblPLgExBWfHgxOHb";
const habitsElement = document.querySelector("#daily-habits");

customElements.define(
  "habit-element",
  class habitElement extends HTMLElement {
    constructor() {
      super().attachShadow({ mode: "open" });
      const id = this.getAttribute("id");
      const title = this.getAttribute("title");
      const status = Number(this.getAttribute("status"));
      const goal = Number(this.getAttribute("goal"));
      const icon = this.getAttribute("icon");
      const tokens = Number(this.getAttribute("tokens"));
      this.shadowRoot.innerHTML = `
        <div class="icon">
          <img src="${icon}">
        </div>
        <div class="text">${title}</div>
        <div class="status">${status}/${goal}</div>
        <button class="add" hidden="${status === goal}">
          <svg viewBox="0 0 24 24">
            <path
              d="M12.67 20.74L12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 9.93 21.5 11.26 20.62 12.61C20 12.31 19.31 12.11 18.59 12.04C19.5 10.8 20 9.65 20 8.5C20 6.5 18.5 5 16.5 5C14.96 5 13.46 6 12.93 7.36H11.07C10.54 6 9.04 5 7.5 5C5.5 5 4 6.5 4 8.5C4 11.39 7.14 14.24 11.89 18.55L12 18.65L12.04 18.61C12.12 19.37 12.34 20.09 12.67 20.74M17 14V17H14V19H17V22H19V19H22V17H19V14H17Z"
            />
          </svg>
        </button>
        <button class="reset" hidden="${status !== goal}">
          <svg viewBox="0 0 24 24">
            <path
              d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"
            />
          </svg>
        </button>
        <style>
          :host {
            align-items: center;
            background: var(--stripchat-red);
            border-radius: 0.5rem;
            color: #ddd;
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            overflow: hidden;
            width: 100%;
            
            svg {
              display: block;
              fill: currentcolor;
              width: 24px;
            }
        
            .icon, .text, .status, button {
              align-items: center;
              display: flex;
              padding: 0.75rem;
            }

            .icon {
              padding: 0.5rem;

              img {
                width: 40px;
              }
            }

            button {
              background: transparent;
              border: 0;
              color: currentcolor;
              cursor: pointer;
              font-size: 1rem;
              height: 100%;
        
              &:hover {
                background: #0002;
              }

              &[hidden=true] {
                display: none;
              }
            }
          }
        </style>
      `;

      const updateStatus = (Status) => {
        updateRecord(habitsTable, id, { Status }).then(() => initHabits());
      };

      const addButton = this.shadowRoot.querySelector(".add");
      addButton.addEventListener("click", async () => {
        if (status < goal) {
          updateStatus(status + 1);
          if (status + 1 === goal) {
            updateTokens(tokens);
          }
        }
      });

      const resetButton = this.shadowRoot.querySelector(".reset");
      resetButton.addEventListener("click", () => {
        updateStatus(0);
        updateTokens(tokens * -1);
      });
    }
  },
);

const initHabits = async () => {
  const { records } = await getRecords(habitsTable);
  habitsElement.innerHTML = "";
  records.forEach(({ id, fields: { Habit, Status, Goal, Tokens, Icon } }) => {
    habitsElement.innerHTML += `
      <habit-element id=${id} title="${Habit}" status="${Status}" goal="${Goal}" tokens="${Tokens}" icon="${Icon}"></habit-element>
    `;
  });
};

initHabits();

// rewards

const rewardsTable = "tblqwanEUCJhcsZSu";

customElements.define(
  "reward-element",
  class rewardElement extends HTMLElement {
    constructor() {
      super().attachShadow({ mode: "open" });
      const id = this.getAttribute("id");
      const title = this.getAttribute("title");
      const requested = this.getAttribute("requested");
      const tokens = Number(this.getAttribute("tokens"));
      this.shadowRoot.innerHTML = `
        <div class="text">${title}</div>
        <div class="tokens">
          ${tokens}
        </div>
        <button class="request" hidden="${requested === "true"}">
          <svg viewBox="0 0 24 24">
            <path 
              d="M11 9H13V6H16V4H13V1H11V4H8V6H11M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18M7.2 14.8V14.7L8.1 13H15.5C16.2 13 16.9 12.6 17.2 12L21.1 5L19.4 4L15.5 11H8.5L4.3 2H1V4H3L6.6 11.6L5.2 14C5.1 14.3 5 14.6 5 15C5 16.1 5.9 17 7 17H19V15H7.4C7.3 15 7.2 14.9 7.2 14.8Z"
            />
          </svg>
        </button>
        <button class="remove" hidden="${requested !== "true"}">
          <svg viewBox="0 0 24 24">
            <path
              d="M16 6V4H8V6M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18M7.2 14.8V14.7L8.1 13H15.5C16.2 13 16.9 12.6 17.2 12L21.1 5L19.4 4L15.5 11H8.5L4.3 2H1V4H3L6.6 11.6L5.2 14C5.1 14.3 5 14.6 5 15C5 16.1 5.9 17 7 17H19V15H7.4C7.3 15 7.2 14.9 7.2 14.8Z"
            />
          </svg>
        </button>
        <style>
          :host {
            align-items: center;
            background: var(--stripchat-red);
            border-radius: 0.5rem;
            color: #ddd;
            display: grid;
            grid-template-columns: 1fr auto auto;
            overflow: hidden;
            width: 100%;
            
            svg {
              display: block;
              fill: currentcolor;
              width: 24px;
            }
        
            .text, .tokens, button {
              align-items: center;
              display: flex;
              padding: 0.75rem;
            }

            button {
              background: transparent;
              border: 0;
              color: currentcolor;
              cursor: pointer;
              font-family: monospace;
              font-size: 1rem;
              height: 100%;
        
              &:hover {
                background: #0002;
              }

              &[hidden=true] {
                display: none;
              }
            }
          }
        </style>
      `;

      const requestButton = this.shadowRoot.querySelector(".request");
      requestButton.addEventListener("click", async () => {
        const { Tokens } = await getAccount();
        if (tokens <= Tokens) {
          const Requested = true;
          updateRecord(rewardsTable, id, { Requested }).then(initRewards);
        }
      });

      const removeButton = this.shadowRoot.querySelector(".remove");
      removeButton.addEventListener("click", async () => {
        const Requested = false;
        updateRecord(rewardsTable, id, { Requested }).then(initRewards);
      });
    }
  },
);

const initRewards = async () => {
  const rewardsRequested = document.querySelector("#rewards-requested");
  const rewardsAvailable = document.querySelector("#rewards-available");
  const rewardsHeadings = document.querySelectorAll("#rewards h2");
  const { records } = await getRecords(rewardsTable);
  const requested = records.filter((reward) => reward.fields.Requested);
  const available = records.filter((reward) => !reward.fields.Requested);
  rewardsRequested.style.display = requested.length ? "flex" : "none";
  rewardsHeadings[0].style.display = requested.length ? "block" : "none";
  rewardsRequested.innerHTML = "";
  requested.forEach(({ id, fields: { Reward, Tokens, Requested } }) => {
    rewardsRequested.innerHTML += `
      <reward-element id=${id} title="${Reward}" requested="${Requested}" tokens="${Tokens}"></reward-element>
    `;
  });
  rewardsAvailable.style.display = available.length ? "flex" : "none";
  rewardsHeadings[1].style.display = available.length ? "block" : "none";
  rewardsAvailable.innerHTML = "";
  available.forEach(({ id, fields: { Reward, Tokens, Requested } }) => {
    rewardsAvailable.innerHTML += `
      <reward-element id=${id} title="${Reward}" requested="${Requested}" tokens="${Tokens}"></reward-element>
    `;
  });
};

initRewards();

// punishments

const punishmentsTable = "tblwPVmH8TXTgutMi";

customElements.define(
  "punishment-element",
  class punishmentElement extends HTMLElement {
    constructor() {
      super().attachShadow({ mode: "open" });
      const id = this.getAttribute("id");
      const title = this.getAttribute("title");
      const requested = this.getAttribute("requested");
      const value = Number(this.getAttribute("value"));
      this.shadowRoot.innerHTML = `
        <div class="text">${title}</div>
        <div class="tokens">
          ${value}
        </div>
        <button class="request" hidden="${requested === "true"}">
          <svg viewBox="0 0 24 24">
            <path 
              d="M11 9H13V6H16V4H13V1H11V4H8V6H11M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18M7.2 14.8V14.7L8.1 13H15.5C16.2 13 16.9 12.6 17.2 12L21.1 5L19.4 4L15.5 11H8.5L4.3 2H1V4H3L6.6 11.6L5.2 14C5.1 14.3 5 14.6 5 15C5 16.1 5.9 17 7 17H19V15H7.4C7.3 15 7.2 14.9 7.2 14.8Z"
            />
          </svg>
        </button>
        <button class="remove" hidden="${requested !== "true"}">
          <svg viewBox="0 0 24 24">
            <path
              d="M16 6V4H8V6M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18M17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18M7.2 14.8V14.7L8.1 13H15.5C16.2 13 16.9 12.6 17.2 12L21.1 5L19.4 4L15.5 11H8.5L4.3 2H1V4H3L6.6 11.6L5.2 14C5.1 14.3 5 14.6 5 15C5 16.1 5.9 17 7 17H19V15H7.4C7.3 15 7.2 14.9 7.2 14.8Z"
            />
          </svg>
        </button>
        <style>
          :host {
            align-items: center;
            background: var(--stripchat-red);
            border-radius: 0.5rem;
            color: #ddd;
            display: grid;
            grid-template-columns: 1fr auto auto;
            overflow: hidden;
            width: 100%;
            
            svg {
              display: block;
              fill: currentcolor;
              width: 24px;
            }
        
            .text, .tokens, button {
              align-items: center;
              display: flex;
              padding: 0.75rem;
            }

            button {
              background: transparent;
              border: 0;
              color: currentcolor;
              cursor: pointer;
              font-family: monospace;
              font-size: 1rem;
              height: 100%;
        
              &:hover {
                background: #0002;
              }

              &[hidden=true] {
                display: none;
              }
            }
          }
        </style>
      `;

      const requestButton = this.shadowRoot.querySelector(".request");
      requestButton.addEventListener("click", async () => {
        const Requested = true;
        updateRecord(punishmentsTable, id, { Requested }).then(initPunishments);
      });

      const removeButton = this.shadowRoot.querySelector(".remove");
      removeButton.addEventListener("click", async () => {
        const Requested = false;
        updateRecord(punishmentsTable, id, { Requested }).then(initPunishments);
      });
    }
  },
);

const initPunishments = async () => {
  const punishmentsRequested = document.querySelector("#punishments-requested");
  const punishmentsAvailable = document.querySelector("#punishments-available");
  const punishmentsHeadings = document.querySelectorAll("#punishments h2");
  const { records } = await getRecords(punishmentsTable);
  const requested = records.filter((punishment) => punishment.fields.Requested);
  const available = records.filter(
    (punishment) => !punishment.fields.Requested,
  );
  punishmentsRequested.style.display = requested.length ? "flex" : "none";
  punishmentsHeadings[0].style.display = requested.length ? "block" : "none";
  punishmentsRequested.innerHTML = "";
  requested.forEach(({ id, fields: { Punishment, Value, Requested } }) => {
    punishmentsRequested.innerHTML += `
      <punishment-element id=${id} title="${Punishment}" requested="${Requested}" value="${Value}"></punishment-element>
    `;
  });
  punishmentsAvailable.style.display = available.length ? "flex" : "none";
  punishmentsHeadings[1].style.display = available.length ? "block" : "none";
  punishmentsAvailable.innerHTML = "";
  available.forEach(({ id, fields: { Punishment, Value, Requested } }) => {
    punishmentsAvailable.innerHTML += `
      <punishment-element id=${id} title="${Punishment}" requested="${Requested}" value="${Value}"></punishment-element>
    `;
  });
};

initPunishments();
