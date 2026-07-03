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
  applyStaticTranslations();
  updateDirectionOptions();
  render();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  });
}
