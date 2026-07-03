(() => {
  const STORAGE_KEY = 'debt-track:data';
  const LANG_KEY = 'debt-track:lang';

  const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'TRY', symbol: '₺', label: 'TRY (₺)' },
  ];
  const DEFAULT_CURRENCY = CURRENCIES[0].code;
  const CURRENCY_SYMBOL = Object.fromEntries(CURRENCIES.map(c => [c.code, c.symbol]));

  const TRANSLATIONS = {
    en: {
      people: 'People',
      addPerson: '+ Add Person',
      selectPersonHint: 'Select a person to see their debt history, or add someone new.',
      rename: 'Rename',
      delete: 'Delete',
      newDebt: 'New debt',
      payment: 'Payment',
      amount: 'Amount',
      noteOptional: 'Note (optional)',
      add: 'Add',
      history: 'History',
      date: 'Date',
      description: 'Description',
      balance: 'Balance',
      name: 'Name',
      cancel: 'Cancel',
      save: 'Save',
      addPersonTitle: 'Add Person',
      renamePersonTitle: 'Rename Person',
      theyOweMe: 'They owe me',
      iOweThem: 'I owe them',
      theyPaidMeBack: 'They paid me back',
      iPaidThemBack: 'I paid them back',
      owedToYou: 'Owed to you',
      youOwe: 'You owe',
      net: 'Net',
      noDebtsYet: 'No debts tracked yet',
      noOneYet: 'No one yet. Add a person to get started.',
      noEntries: 'No entries',
      noHistoryYet: 'No history yet.',
      noEntriesYet: 'No entries yet.',
      settledUpIn: 'Settled up in {currency}',
      theyOweYouAmount: '{name} owes you {amount}',
      youOweAmount: 'You owe {name} {amount}',
      newDebtTheyOwe: 'New debt: {name} owes you',
      newDebtYouOwe: 'New debt: you owe {name}',
      paymentTheyPaid: 'Payment: {name} paid you back',
      paymentYouPaid: 'Payment: you paid {name} back',
      confirmDeletePerson: "Delete {name} and all their history? This can't be undone.",
      enterAmountAlert: 'Enter an amount greater than 0.',
      langToggle: 'TR',
      debtsTab: 'Debts',
      groupExpenseTab: 'Group Expense',
      groupExpenseHint: "Add people, enter each person's share of the bill and what they actually paid, and see who owes whom.",
      currency: 'Currency',
      share: 'Share',
      paid: 'Paid',
      reset: 'Reset',
      confirmResetGroup: 'Clear this group expense and start over?',
      noParticipantsYet: 'Add people to split a bill.',
      settlementHeading: 'Who pays whom',
      allSettled: 'Everyone is settled up.',
      settlementLine: '{from} pays {to} {amount}',
      totalShareLabel: 'Total bill',
      totalPaidLabel: 'Total paid',
    },
    tr: {
      people: 'Kişiler',
      addPerson: '+ Kişi Ekle',
      selectPersonHint: 'Borç geçmişini görmek için bir kişi seçin, ya da yeni biri ekleyin.',
      rename: 'Yeniden Adlandır',
      delete: 'Sil',
      newDebt: 'Yeni borç',
      payment: 'Ödeme',
      amount: 'Tutar',
      noteOptional: 'Not (isteğe bağlı)',
      add: 'Ekle',
      history: 'Geçmiş',
      date: 'Tarih',
      description: 'Açıklama',
      balance: 'Bakiye',
      name: 'İsim',
      cancel: 'İptal',
      save: 'Kaydet',
      addPersonTitle: 'Kişi Ekle',
      renamePersonTitle: 'Kişiyi Yeniden Adlandır',
      theyOweMe: 'Bana borçlu',
      iOweThem: 'Ona borçluyum',
      theyPaidMeBack: 'Bana geri ödedi',
      iPaidThemBack: 'Ona geri ödedim',
      owedToYou: 'Sana borçlu',
      youOwe: 'Senin borcun',
      net: 'Net',
      noDebtsYet: 'Henüz borç kaydı yok',
      noOneYet: 'Henüz kimse yok. Başlamak için bir kişi ekleyin.',
      noEntries: 'Kayıt yok',
      noHistoryYet: 'Henüz geçmiş yok.',
      noEntriesYet: 'Henüz kayıt yok.',
      settledUpIn: '{currency} cinsinden ödeşildi',
      theyOweYouAmount: '{name} sana {amount} borçlu',
      youOweAmount: '{name} kişisine {amount} borçlusun',
      newDebtTheyOwe: 'Yeni borç: {name} sana borçlandı',
      newDebtYouOwe: 'Yeni borç: {name} kişisine borçlandın',
      paymentTheyPaid: 'Ödeme: {name} sana geri ödedi',
      paymentYouPaid: 'Ödeme: {name} kişisine geri ödedin',
      confirmDeletePerson: '{name} ve tüm geçmişi silinsin mi? Bu işlem geri alınamaz.',
      enterAmountAlert: "0'dan büyük bir tutar girin.",
      langToggle: 'EN',
      debtsTab: 'Borç Takibi',
      groupExpenseTab: 'Grup Harcaması',
      groupExpenseHint: 'Kişileri ekleyin, her kişinin hesaptaki payını ve gerçekte ne ödediğini girin; kimin kime borçlu olduğunu görün.',
      currency: 'Para Birimi',
      share: 'Payı',
      paid: 'Ödediği',
      reset: 'Sıfırla',
      confirmResetGroup: 'Bu grup harcaması temizlensin ve yeniden mi başlansın?',
      noParticipantsYet: 'Hesabı bölüştürmek için kişi ekleyin.',
      settlementHeading: 'Kim Kime Ne Kadar Verecek',
      allSettled: 'Herkes hesaplaştı.',
      settlementLine: '{from}, {to} kişisine {amount} verecek',
      totalShareLabel: 'Toplam Hesap',
      totalPaidLabel: 'Toplam Ödenen',
    },
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) === 'tr' ? 'tr' : 'en';
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  function t(key, vars) {
    const lang = getLang();
    let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  }

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

  const GROUP_STORAGE_KEY = 'debt-track:group-expense';

  /** @typedef {{id:string,name:string,share:number,paid:number}} Participant */

  function loadGroup() {
    try {
      const raw = localStorage.getItem(GROUP_STORAGE_KEY);
      if (!raw) return { currency: DEFAULT_CURRENCY, participants: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.participants)) return { currency: DEFAULT_CURRENCY, participants: [] };
      if (!parsed.currency) parsed.currency = DEFAULT_CURRENCY;
      return parsed;
    } catch {
      return { currency: DEFAULT_CURRENCY, participants: [] };
    }
  }

  function saveGroup() {
    localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(state.group));
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
    const safeWho = escapeHtml(who);
    if (Math.abs(n) < 0.005) return t('settledUpIn', { currency });
    if (n > 0) return t('theyOweYouAmount', { name: safeWho, amount: fmtMoney(n, currency) });
    return t('youOweAmount', { name: safeWho, amount: fmtMoney(n, currency) });
  }

  const state = {
    data: loadData(),
    selectedPersonId: null,
    group: loadGroup(),
    activeTab: 'debts',
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
    langToggle: document.getElementById('lang-toggle'),
    tabDebtsBtn: document.getElementById('tab-debts-btn'),
    tabGroupBtn: document.getElementById('tab-group-btn'),
    debtsView: document.getElementById('debts-view'),
    groupView: document.getElementById('group-view'),
    groupResetBtn: document.getElementById('group-reset-btn'),
    groupCurrency: document.getElementById('group-currency'),
    groupParticipantsBody: document.getElementById('group-participants-body'),
    groupAddParticipantBtn: document.getElementById('group-add-participant-btn'),
    groupTotals: document.getElementById('group-totals'),
    groupSettlements: document.getElementById('group-settlements'),
  };

  function getSelectedPerson() {
    return state.data.people.find(p => p.id === state.selectedPersonId) || null;
  }

  function applyStaticTranslations() {
    document.documentElement.lang = getLang();
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      elem.textContent = t(elem.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
      elem.placeholder = t(elem.dataset.i18nPlaceholder);
    });
    el.langToggle.textContent = t('langToggle');
  }

  function updateDirectionOptions() {
    const kind = document.querySelector('input[name="entry-kind"]:checked').value;
    const options = kind === 'debt'
      ? [
          { value: 'they_owe_me', label: t('theyOweMe') },
          { value: 'i_owe_them', label: t('iOweThem') },
        ]
      : [
          { value: 'they_owe_me', label: t('theyPaidMeBack') },
          { value: 'i_owe_them', label: t('iPaidThemBack') },
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
        const tot = totals[currency] || (totals[currency] = { theyOweMe: 0, iOweThem: 0 });
        if (bal > 0) tot.theyOweMe += bal;
        else tot.iOweThem += -bal;
      }
    }
    const usedCurrencies = CURRENCIES.filter(c => totals[c.code]);
    if (usedCurrencies.length === 0) {
      el.summary.innerHTML = `<div class="figure"><span class="label">${t('noDebtsYet')}</span></div>`;
      return;
    }
    el.summary.innerHTML = usedCurrencies.map(c => {
      const tot = totals[c.code];
      const net = tot.theyOweMe - tot.iOweThem;
      return `
        <div class="currency-group">
          <span class="currency-code">${c.code}</span>
          <div class="figure">
            <span class="label">${t('owedToYou')}</span>
            <span class="value positive">${fmtMoney(tot.theyOweMe, c.code)}</span>
          </div>
          <div class="figure">
            <span class="label">${t('youOwe')}</span>
            <span class="value negative">${fmtMoney(tot.iOweThem, c.code)}</span>
          </div>
          <div class="figure">
            <span class="label">${t('net')}</span>
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
      li.textContent = t('noOneYet');
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
        ? `<span class="balance zero">${t('noEntries')}</span>`
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
      ? `<span class="amount zero">${t('noHistoryYet')}</span>`
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
      tr.innerHTML = `<td colspan="5" class="empty-state">${t('noEntriesYet')}</td>`;
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
    const safeName = escapeHtml(name);
    if (entry.kind === 'debt') {
      return entry.direction === 'they_owe_me'
        ? t('newDebtTheyOwe', { name: safeName })
        : t('newDebtYouOwe', { name: safeName });
    }
    return entry.direction === 'they_owe_me'
      ? t('paymentTheyPaid', { name: safeName })
      : t('paymentYouPaid', { name: safeName });
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

  // ---- group expense (bill splitting) ----
  function computeSettlements(balances) {
    const creditors = balances
      .filter(b => b.amount > 0.005)
      .map(b => ({ ...b }))
      .sort((a, b) => b.amount - a.amount);
    const debtors = balances
      .filter(b => b.amount < -0.005)
      .map(b => ({ ...b, amount: -b.amount }))
      .sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
      debtors[i].amount -= pay;
      creditors[j].amount -= pay;
      if (debtors[i].amount < 0.005) i++;
      if (creditors[j].amount < 0.005) j++;
    }
    return settlements;
  }

  function renderGroupParticipantRows() {
    el.groupParticipantsBody.innerHTML = '';
    if (state.group.participants.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" class="empty-state">${t('noParticipantsYet')}</td>`;
      el.groupParticipantsBody.appendChild(tr);
      return;
    }
    for (const participant of state.group.participants) {
      const tr = document.createElement('tr');
      tr.dataset.id = participant.id;
      tr.innerHTML = `
        <td><input type="text" class="gname" value="${escapeHtml(participant.name)}"></td>
        <td class="num"><input type="number" class="gshare" value="${participant.share}" min="0" step="0.01"></td>
        <td class="num"><input type="number" class="gpaid" value="${participant.paid}" min="0" step="0.01"></td>
        <td class="num gbalance"></td>
        <td><button class="delete-entry" title="Delete" data-id="${participant.id}">&times;</button></td>
      `;
      const nameInput = tr.querySelector('.gname');
      const shareInput = tr.querySelector('.gshare');
      const paidInput = tr.querySelector('.gpaid');
      nameInput.addEventListener('input', () => {
        participant.name = nameInput.value;
        saveGroup();
        renderGroupComputed();
      });
      shareInput.addEventListener('input', () => {
        participant.share = parseFloat(shareInput.value) || 0;
        saveGroup();
        renderGroupComputed();
      });
      paidInput.addEventListener('input', () => {
        participant.paid = parseFloat(paidInput.value) || 0;
        saveGroup();
        renderGroupComputed();
      });
      tr.querySelector('.delete-entry').addEventListener('click', () => {
        state.group.participants = state.group.participants.filter(p => p.id !== participant.id);
        saveGroup();
        renderGroupParticipantRows();
        renderGroupComputed();
      });
      el.groupParticipantsBody.appendChild(tr);
    }
  }

  function renderGroupComputed() {
    const currency = state.group.currency;
    const balances = state.group.participants.map(p => ({
      id: p.id,
      name: p.name || t('name'),
      amount: p.paid - p.share,
    }));

    el.groupParticipantsBody.querySelectorAll('tr').forEach(tr => {
      const id = tr.dataset.id;
      const bal = balances.find(b => b.id === id);
      const cell = tr.querySelector('.gbalance');
      if (bal && cell) {
        cell.textContent = `${bal.amount >= 0 ? '+' : '-'}${fmtMoney(bal.amount, currency)}`;
        cell.className = `num gbalance ${balanceClass(bal.amount)}`;
      }
    });

    const totalShare = state.group.participants.reduce((sum, p) => sum + p.share, 0);
    const totalPaid = state.group.participants.reduce((sum, p) => sum + p.paid, 0);
    el.groupTotals.innerHTML = `
      <div class="figure">
        <span class="label">${t('totalShareLabel')}</span>
        <span class="value">${fmtMoney(totalShare, currency)}</span>
      </div>
      <div class="figure">
        <span class="label">${t('totalPaidLabel')}</span>
        <span class="value">${fmtMoney(totalPaid, currency)}</span>
      </div>
    `;

    const settlements = computeSettlements(balances);
    if (settlements.length === 0) {
      el.groupSettlements.innerHTML = `<p class="empty-state">${t('allSettled')}</p>`;
    } else {
      el.groupSettlements.innerHTML = settlements.map(s => {
        const line = t('settlementLine', {
          from: escapeHtml(s.from || t('name')),
          to: escapeHtml(s.to || t('name')),
          amount: `<strong>${fmtMoney(s.amount, currency)}</strong>`,
        });
        return `<div class="settlement-row"><span>${line}</span></div>`;
      }).join('');
    }
  }

  function renderGroup() {
    renderGroupParticipantRows();
    renderGroupComputed();
  }

  function switchTab(tab) {
    state.activeTab = tab;
    el.tabDebtsBtn.classList.toggle('active', tab === 'debts');
    el.tabGroupBtn.classList.toggle('active', tab === 'group');
    el.debtsView.classList.toggle('hidden', tab !== 'debts');
    el.groupView.classList.toggle('hidden', tab !== 'group');
    if (tab === 'group') renderGroup();
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
    const name = await openModal(t('addPersonTitle'), '');
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
    const name = await openModal(t('renamePersonTitle'), person.name);
    if (!name) return;
    person.name = name;
    saveData();
    render();
  });

  el.deletePersonBtn.addEventListener('click', () => {
    const person = getSelectedPerson();
    if (!person) return;
    if (!confirm(t('confirmDeletePerson', { name: person.name }))) return;
    state.data.people = state.data.people.filter(p => p.id !== person.id);
    state.selectedPersonId = null;
    saveData();
    render();
  });

  el.langToggle.addEventListener('click', () => {
    setLang(getLang() === 'tr' ? 'en' : 'tr');
    applyStaticTranslations();
    updateDirectionOptions();
    render();
    if (state.activeTab === 'group') renderGroup();
  });

  el.tabDebtsBtn.addEventListener('click', () => switchTab('debts'));
  el.tabGroupBtn.addEventListener('click', () => switchTab('group'));

  el.groupAddParticipantBtn.addEventListener('click', () => {
    state.group.participants.push({ id: uid(), name: '', share: 0, paid: 0 });
    saveGroup();
    renderGroupParticipantRows();
    renderGroupComputed();
  });

  el.groupResetBtn.addEventListener('click', () => {
    if (state.group.participants.length === 0) return;
    if (!confirm(t('confirmResetGroup'))) return;
    state.group = { currency: state.group.currency, participants: [] };
    saveGroup();
    renderGroup();
  });

  el.groupCurrency.addEventListener('change', () => {
    state.group.currency = el.groupCurrency.value;
    saveGroup();
    renderGroupComputed();
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
      alert(t('enterAmountAlert'));
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
  el.groupCurrency.innerHTML = CURRENCIES.map(c => `<option value="${c.code}">${c.label}</option>`).join('');
  el.groupCurrency.value = state.group.currency;
  applyStaticTranslations();
  updateDirectionOptions();
  render();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  });
}
