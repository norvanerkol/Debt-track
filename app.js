(() => {
  const STORAGE_KEY = 'debt-track:data';

  const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'TRY', symbol: '₺', label: 'TRY (₺)' },
  ];
  const DEFAULT_CURRENCY = CURRENCIES[0].code;
  const CURRENCY_SYMBOL = Object.fromEntries(CURRENCIES.map(c => [c.code, c.symbol]));

  /** @typedef {{id:string,date:string,kind:'debt'|'payment',direction:'they_owe_me'|'i_owe_them',amount:number,currency:string,note:string}} Entry */
  /** @typedef {{id:string,name:string,entries:Entry[]}} Person */

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { people: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.people)) return { people: [] };
      for (const person of parsed.people) {
        for (const entry of person.entries || []) {
          if (!entry.currency) entry.currency = DEFAULT_CURRENCY;
        }
      }
      return parsed;
    } catch {
      return { people: [] };
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function entryDelta(entry) {
    const sign = entry.direction === 'they_owe_me' ? 1 : -1;
    const kindSign = entry.kind === 'debt' ? 1 : -1;
    return sign * kindSign * entry.amount;
  }

  /** currency code -> net balance, only for currencies that appear in the person's entries */
  function personBalancesByCurrency(person) {
    const balances = {};
    for (const e of person.entries) {
      balances[e.currency] = (balances[e.currency] || 0) + entryDelta(e);
    }
    return balances;
  }

  function currenciesUsed(person) {
    const used = new Set(person.entries.map(e => e.currency));
    return CURRENCIES.filter(c => used.has(c.code));
  }

  function fmtMoney(n, currency) {
    const abs = Math.abs(n);
    const symbol = CURRENCY_SYMBOL[currency] || '';
    return `${symbol}${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function balanceClass(n) {
    if (n > 0.004) return 'positive';
    if (n < -0.004) return 'negative';
    return 'zero';
  }

  function balanceText(n, currency, who) {
    if (Math.abs(n) < 0.005) return `Settled up in ${currency}`;
    if (n > 0) return `${who} owes you ${fmtMoney(n, currency)}`;
    return `You owe ${who} ${fmtMoney(n, currency)}`;
  }

  const state = {
    data: loadData(),
    selectedPersonId: null,
  };

  // ---- DOM refs ----
  const el = {
    peopleList: document.getElementById('people-list'),
    addPersonBtn: document.getElementById('add-person-btn'),
    summary: document.getElementById('summary'),
    detailEmpty: document.getElementById('detail-empty'),
    detailContent: document.getElementById('detail-content'),
    detailName: document.getElementById('detail-name'),
    balanceBox: document.getElementById('balance-box'),
    renameBtn: document.getElementById('rename-btn'),
    deletePersonBtn: document.getElementById('delete-person-btn'),
    entryDirection: document.getElementById('entry-direction'),
    entryAmount: document.getElementById('entry-amount'),
    entryCurrency: document.getElementById('entry-currency'),
    entryNote: document.getElementById('entry-note'),
    entryDate: document.getElementById('entry-date'),
    addEntryBtn: document.getElementById('add-entry-btn'),
    historyBody: document.getElementById('history-body'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalInput: document.getElementById('modal-input'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalOkBtn: document.getElementById('modal-ok-btn'),
  };

  function getSelectedPerson() {
    return state.data.people.find(p => p.id === state.selectedPersonId) || null;
  }

  function updateDirectionOptions() {
    const kind = document.querySelector('input[name="entry-kind"]:checked').value;
    const options = kind === 'debt'
      ? [
          { value: 'they_owe_me', label: 'They owe me' },
          { value: 'i_owe_them', label: 'I owe them' },
        ]
      : [
          { value: 'they_owe_me', label: 'They paid me back' },
          { value: 'i_owe_them', label: 'I paid them back' },
        ];
    el.entryDirection.innerHTML = options
      .map(o => `<option value="${o.value}">${o.label}</option>`)
      .join('');
  }

  function renderSummary() {
    const totals = {}; // currency -> { theyOweMe, iOweThem }
    for (const p of state.data.people) {
      const balances = personBalancesByCurrency(p);
      for (const [currency, bal] of Object.entries(balances)) {
        const t = totals[currency] || (totals[currency] = { theyOweMe: 0, iOweThem: 0 });
        if (bal > 0) t.theyOweMe += bal;
        else t.iOweThem += -bal;
      }
    }
    const usedCurrencies = CURRENCIES.filter(c => totals[c.code]);
    if (usedCurrencies.length === 0) {
      el.summary.innerHTML = `<div class="figure"><span class="label">No debts tracked yet</span></div>`;
      return;
    }
    el.summary.innerHTML = usedCurrencies.map(c => {
      const t = totals[c.code];
      const net = t.theyOweMe - t.iOweThem;
      return `
        <div class="currency-group">
          <span class="currency-code">${c.code}</span>
          <div class="figure">
            <span class="label">Owed to you</span>
            <span class="value positive">${fmtMoney(t.theyOweMe, c.code)}</span>
          </div>
          <div class="figure">
            <span class="label">You owe</span>
            <span class="value negative">${fmtMoney(t.iOweThem, c.code)}</span>
          </div>
          <div class="figure">
            <span class="label">Net</span>
            <span class="value ${balanceClass(net)}">${net >= 0 ? '+' : '-'}${fmtMoney(net, c.code)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderPeopleList() {
    el.peopleList.innerHTML = '';
    const sorted = [...state.data.people].sort((a, b) => a.name.localeCompare(b.name));
    if (sorted.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-state';
      li.textContent = 'No one yet. Add a person to get started.';
      el.peopleList.appendChild(li);
      return;
    }
    for (const p of sorted) {
      const balances = personBalancesByCurrency(p);
      const used = currenciesUsed(p);
      const li = document.createElement('li');
      li.className = 'person-item' + (p.id === state.selectedPersonId ? ' active' : '');
      li.dataset.id = p.id;
      const balanceLines = used.length === 0
        ? '<span class="balance zero">No entries</span>'
        : used.map(c => {
            const bal = balances[c.code] || 0;
            return `<span class="balance ${balanceClass(bal)}">${bal >= 0 ? '+' : '-'}${fmtMoney(bal, c.code)}</span>`;
          }).join('');
      li.innerHTML = `
        <span class="name">${escapeHtml(p.name)}</span>
        <span class="balance-stack">${balanceLines}</span>
      `;
      li.addEventListener('click', () => {
        state.selectedPersonId = p.id;
        render();
      });
      el.peopleList.appendChild(li);
    }
  }

  function renderDetail() {
    const person = getSelectedPerson();
    if (!person) {
      el.detailEmpty.classList.remove('hidden');
      el.detailContent.classList.add('hidden');
      return;
    }
    el.detailEmpty.classList.add('hidden');
    el.detailContent.classList.remove('hidden');
    el.detailName.textContent = person.name;

    const balances = personBalancesByCurrency(person);
    const used = currenciesUsed(person);
    el.balanceBox.innerHTML = used.length === 0
      ? `<span class="amount zero">No history yet.</span>`
      : used.map(c => {
          const bal = balances[c.code] || 0;
          return `<div class="amount ${balanceClass(bal)}">${balanceText(bal, c.code, person.name)}</div>`;
        }).join('');

    // history, most recent first, with running balance computed chronologically per currency
    const sortedAsc = [...person.entries].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });
    const runningByCurrency = {};
    const rows = sortedAsc.map(entry => {
      runningByCurrency[entry.currency] = (runningByCurrency[entry.currency] || 0) + entryDelta(entry);
      return { entry, running: runningByCurrency[entry.currency] };
    });
    rows.reverse();

    el.historyBody.innerHTML = '';
    if (rows.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" class="empty-state">No entries yet.</td>`;
      el.historyBody.appendChild(tr);
    } else {
      for (const { entry, running } of rows) {
        const delta = entryDelta(entry);
        const desc = describeEntry(entry, person.name);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${entry.date}</td>
          <td>${desc}${entry.note ? ` &mdash; <span class="muted">${escapeHtml(entry.note)}</span>` : ''}</td>
          <td class="num amount ${delta >= 0 ? 'positive' : 'negative'}">${delta >= 0 ? '+' : '-'}${fmtMoney(delta, entry.currency)}</td>
          <td class="num amount ${balanceClass(running)}">${running >= 0 ? '+' : '-'}${fmtMoney(running, entry.currency)}</td>
          <td><button class="delete-entry" title="Delete entry" data-entry-id="${entry.id}">&times;</button></td>
        `;
        el.historyBody.appendChild(tr);
      }
    }

    el.historyBody.querySelectorAll('.delete-entry').forEach(btn => {
      btn.addEventListener('click', () => {
        const entryId = btn.dataset.entryId;
        person.entries = person.entries.filter(e => e.id !== entryId);
        saveData();
        render();
      });
    });
  }

  function describeEntry(entry, name) {
    if (entry.kind === 'debt') {
      return entry.direction === 'they_owe_me'
        ? `New debt: ${escapeHtml(name)} owes you`
        : `New debt: you owe ${escapeHtml(name)}`;
    }
    return entry.direction === 'they_owe_me'
      ? `Payment: ${escapeHtml(name)} paid you back`
      : `Payment: you paid ${escapeHtml(name)} back`;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function render() {
    renderSummary();
    renderPeopleList();
    renderDetail();
  }

  // ---- modal helpers ----
  let modalResolve = null;
  function openModal(title, initialValue) {
    el.modalTitle.textContent = title;
    el.modalInput.value = initialValue || '';
    el.modalOverlay.classList.remove('hidden');
    el.modalInput.focus();
    return new Promise(resolve => { modalResolve = resolve; });
  }
  function closeModal(value) {
    el.modalOverlay.classList.add('hidden');
    if (modalResolve) {
      modalResolve(value);
      modalResolve = null;
    }
  }
  el.modalOkBtn.addEventListener('click', () => closeModal(el.modalInput.value.trim()));
  el.modalCancelBtn.addEventListener('click', () => closeModal(null));
  el.modalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') closeModal(el.modalInput.value.trim());
    if (e.key === 'Escape') closeModal(null);
  });
  el.modalOverlay.addEventListener('click', e => {
    if (e.target === el.modalOverlay) closeModal(null);
  });

  // ---- event wiring ----
  el.addPersonBtn.addEventListener('click', async () => {
    const name = await openModal('Add Person', '');
    if (!name) return;
    const person = { id: uid(), name, entries: [] };
    state.data.people.push(person);
    state.selectedPersonId = person.id;
    saveData();
    render();
  });

  el.renameBtn.addEventListener('click', async () => {
    const person = getSelectedPerson();
    if (!person) return;
    const name = await openModal('Rename Person', person.name);
    if (!name) return;
    person.name = name;
    saveData();
    render();
  });

  el.deletePersonBtn.addEventListener('click', () => {
    const person = getSelectedPerson();
    if (!person) return;
    if (!confirm(`Delete ${person.name} and all their history? This can't be undone.`)) return;
    state.data.people = state.data.people.filter(p => p.id !== person.id);
    state.selectedPersonId = null;
    saveData();
    render();
  });

  document.querySelectorAll('input[name="entry-kind"]').forEach(radio => {
    radio.addEventListener('change', updateDirectionOptions);
  });

  el.addEntryBtn.addEventListener('click', () => {
    const person = getSelectedPerson();
    if (!person) return;
    const kind = document.querySelector('input[name="entry-kind"]:checked').value;
    const direction = el.entryDirection.value;
    const amount = parseFloat(el.entryAmount.value);
    const currency = el.entryCurrency.value;
    const note = el.entryNote.value.trim();
    const date = el.entryDate.value || todayStr();

    if (!amount || amount <= 0) {
      alert('Enter an amount greater than 0.');
      return;
    }

    person.entries.push({ id: uid(), date, kind, direction, amount, currency, note });
    saveData();

    el.entryAmount.value = '';
    el.entryNote.value = '';
    render();
  });

  // ---- init ----
  el.entryDate.value = todayStr();
  el.entryCurrency.innerHTML = CURRENCIES.map(c => `<option value="${c.code}">${c.label}</option>`).join('');
  updateDirectionOptions();
  render();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
