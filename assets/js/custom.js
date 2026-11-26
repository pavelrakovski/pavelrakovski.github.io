document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ld11-form');
  if (!form) return;

  const vardasInput = document.getElementById('vardas');
  const pavardeInput = document.getElementById('pavarde');
  const elpastasInput = document.getElementById('elpastas');
  const telefonasInput = document.getElementById('telefonas');
  const adresasInput = document.getElementById('adresas');
  const q1Input = document.getElementById('klausimas1');
  const q2Input = document.getElementById('klausimas2');
  const q3Input = document.getElementById('klausimas3');

  const submitBtn = document.getElementById('submit-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultBox = document.getElementById('form-result');

  const allInputs = [
    vardasInput,
    pavardeInput,
    elpastasInput,
    telefonasInput,
    adresasInput,
    q1Input,
    q2Input,
    q3Input,
  ];

  // Только буквы (включая литовские, латиницу и кириллицу)
  const lettersOnlyRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūžА-Яа-яЁё\s-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const errorEl = form.querySelector(`[data-error-for="${input.id}"]`);
    if (message) {
      input.classList.add('is-invalid-field');
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      input.classList.remove('is-invalid-field');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  // Форматирование литовского номера в формат +370 6xx xxxxx (только цифры)
  function formatLithuanianPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, '');

    // Если пользователь начал вводить с 370, оставляем цифры после кода страны
    if (digits.startsWith('370')) {
      digits = digits.slice(3);
    }

    // Ограничиваем максимум 8 цифрами после +370 (например, 61234567)
    digits = digits.slice(0, 8);

    if (digits.length === 0) {
      return '';
    }

    let formatted = '+370';
    if (digits.length > 0) {
      formatted += ' ' + digits.slice(0, 3);
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 8);
    }
    return formatted;
  }

  function validateField(input) {
    const val = input.value.trim();

    if (input === vardasInput) {
      if (!val) return setError(input, 'Vardas yra privalomas.');
      if (!lettersOnlyRegex.test(val)) return setError(input, 'Vardą gali sudaryti tik raidės.');
      return setError(input, '');
    }

    if (input === pavardeInput) {
      if (!val) return setError(input, 'Pavardė yra privaloma.');
      if (!lettersOnlyRegex.test(val)) return setError(input, 'Pavardę gali sudaryti tik raidės.');
      return setError(input, '');
    }

    if (input === elpastasInput) {
      if (!val) return setError(input, 'El. paštas yra privalomas.');
      if (!emailRegex.test(val)) return setError(input, 'Įveskite teisingą el. pašto adresą.');
      return setError(input, '');
    }

    if (input === telefonasInput) {
      // Ожидаемый формат: +370 6xx xxxxx (всего 11 цифр: 370 + 8 цифр)
      const digits = val.replace(/\D/g, '');
      if (!val) return setError(input, 'Telefono numeris yra privalomas.');
      if (!digits.startsWith('3706') || digits.length !== 11) {
        return setError(input, 'Formatas turi būti +370 6xx xxxxx.');
      }
      return setError(input, '');
    }

    if (input === adresasInput) {
      if (!val) return setError(input, 'Adresas yra privalomas.');
      return setError(input, '');
    }

    if (input === q1Input || input === q2Input || input === q3Input) {
      if (val === '') return setError(input, 'Įveskite įvertinimą nuo 1 iki 10.');
      const num = Number(val);
      if (!Number.isInteger(num) || num < 1 || num > 10) {
        return setError(input, 'Reikšmė turi būti sveikas skaičius nuo 1 iki 10.');
      }
      return setError(input, '');
    }

    return true;
  }

  function validateAllAndToggleButton() {
    let allValid = true;
    for (const input of allInputs) {
      const isFieldValid = validateField(input);
      if (!isFieldValid) {
        allValid = false;
      }
    }
    submitBtn.disabled = !allValid;
    return allValid;
  }

  // Обработка ввода телефона в реальном времени
  telefonasInput.addEventListener('input', () => {
    telefonasInput.value = formatLithuanianPhone(telefonasInput.value);
    validateField(telefonasInput);
    validateAllAndToggleButton();
  });

  // Валидация остальных полей в реальном времени
  allInputs.forEach((input) => {
    if (input === telefonasInput) return;
    input.addEventListener('input', () => {
      validateField(input);
      validateAllAndToggleButton();
    });
    input.addEventListener('blur', () => {
      validateField(input);
      validateAllAndToggleButton();
    });
  });

  // Отправка формы без перезагрузки страницы
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateAllAndToggleButton()) {
      return;
    }

    const v1 = Number(q1Input.value.trim());
    const v2 = Number(q2Input.value.trim());
    const v3 = Number(q3Input.value.trim());
    const average = ((v1 + v2 + v3) / 3).toFixed(1);

    const formDataObj = {
      vardas: vardasInput.value.trim(),
      pavarde: pavardeInput.value.trim(),
      elPastas: elpastasInput.value.trim(),
      telefonoNumeris: telefonasInput.value.trim(),
      adresas: adresasInput.value.trim(),
      klausimas1: v1,
      klausimas2: v2,
      klausimas3: v3,
      vidurkis: Number(average),
    };

    console.log('Formos duomenų objektas:', formDataObj);

    resultBox.innerHTML = `
      <div class="ld11-output-box">
        <p><strong>Vardas:</strong> ${formDataObj.vardas}</p>
        <p><strong>Pavardė:</strong> ${formDataObj.pavarde}</p>
        <p><strong>El. paštas:</strong> ${formDataObj.elPastas}</p>
        <p><strong>Tel. Numeris:</strong> ${formDataObj.telefonoNumeris}</p>
        <p><strong>Adresas:</strong> ${formDataObj.adresas}</p>
        <p><strong>1 klausimas (1–10):</strong> ${formDataObj.klausimas1}</p>
        <p><strong>2 klausimas (1–10):</strong> ${formDataObj.klausimas2}</p>
        <p><strong>3 klausimas (1–10):</strong> ${formDataObj.klausimas3}</p>
        <hr>
        <p class="ld11-average"><strong>${formDataObj.vardas} ${formDataObj.pavarde}: ${average}</strong></p>
      </div>
    `;
  });

  // Кнопка „Išvalyti“ — очистка полей, вывода, среднего балла и ошибок без перезагрузки
  clearBtn.addEventListener('click', () => {
    form.reset();
    resultBox.innerHTML = '';
    allInputs.forEach((input) => {
      input.classList.remove('is-invalid-field');
      const errorEl = form.querySelector(`[data-error-for="${input.id}"]`);
      if (errorEl) errorEl.textContent = '';
    });
    submitBtn.disabled = true;
  });

  // Изначально кнопка „Siųsti“ неактивна
  submitBtn.disabled = true;
});
document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('skill-kanban');
  if (!boardEl) return;

  const STORAGE_KEY = 'ld12_skill_statuses_v1';
  const STATUSES = ['Planuojama', 'Mokomasi', 'Atlikta'];

  // 7 навыков (от 6 до 8), XP от 20 до 80, общая сумма = 365 XP (>= 300 XP)
  const initialSkills = [
    { id: 'plc', title: 'PLC programavimas (TIA Portal)', status: 'Planuojama', xp: 65 },
    { id: 'scada', title: 'SCADA sistemos ir HMI', status: 'Planuojama', xp: 55 },
    { id: 'sensors', title: 'Pramoninė automatika ir jutikliai', status: 'Mokomasi', xp: 60 },
    { id: 'schemes', title: 'Elektros schemos ir pavaros', status: 'Mokomasi', xp: 50 },
    { id: 'networks', title: 'Modbus / Profibus tinklai', status: 'Mokomasi', xp: 40 },
    { id: 'relay', title: 'Relinė logika ir valdymo spintos', status: 'Atlikta', xp: 55 },
    { id: 'signals', title: 'Matavimų ir signalų pagrindai', status: 'Atlikta', xp: 40 },
  ];

  function loadSkills() {
    const skills = initialSkills.map((item) => ({ ...item }));
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) return skills;
      const savedMap = JSON.parse(savedRaw);
      return skills.map((skill) => {
        const nextStatus = savedMap[skill.id];
        return STATUSES.includes(nextStatus) ? { ...skill, status: nextStatus } : skill;
      });
    } catch (e) {
      return skills;
    }
  }

  function saveStatuses(skills) {
    try {
      const statusMap = {};
      skills.forEach((skill) => {
        statusMap[skill.id] = skill.status;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
    } catch (e) {
      // Игнорируем ошибки доступа к хранилищу
    }
  }

  function getLevelInfo(totalXp) {
    if (totalXp >= 300) {
      return {
        level: 4,
        rank: 'Profesionalas',
        progressPercent: 100,
      };
    }
    if (totalXp >= 150) {
      return {
        level: 3,
        rank: 'Specialistas',
        progressPercent: Math.round(((totalXp - 150) / (300 - 150)) * 100),
      };
    }
    if (totalXp >= 50) {
      return {
        level: 2,
        rank: 'Praktikantas',
        progressPercent: Math.round(((totalXp - 50) / (150 - 50)) * 100),
      };
    }
    return {
      level: 1,
      rank: 'Pradedantysis',
      progressPercent: Math.round((totalXp / 50) * 100),
    };
  }

  function renderKanbanCards(skills, onStatusChange) {
    const columnContainers = boardEl.querySelectorAll('[data-status-column]');
    columnContainers.forEach((col) => {
      col.innerHTML = '';
    });

    skills.forEach((skill) => {
      const targetColumn = boardEl.querySelector(`[data-status-column="${skill.status}"]`);
      if (!targetColumn) return;

      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.dataset.skillId = skill.id;

      const optionsHtml = STATUSES.map(
        (st) => `<option value="${st}" ${skill.status === st ? 'selected' : ''}>${st}</option>`
      ).join('');

      card.innerHTML = `
        <div class="kanban-card-title">${skill.title}</div>
        <div class="kanban-card-meta">
          <span class="kanban-status-label">Būsena: ${skill.status}</span>
          <span class="kanban-xp-badge">${skill.xp} XP</span>
        </div>
        <div class="kanban-card-controls mt-2">
          <select class="form-select form-select-sm kanban-status-select" aria-label="Keisti būseną">
            ${optionsHtml}
          </select>
        </div>
      `;

      const selectEl = card.querySelector('.kanban-status-select');
      selectEl.addEventListener('change', (event) => {
        onStatusChange(skill.id, event.target.value);
      });

      targetColumn.appendChild(card);
    });
  }

  function updateProgressAndStats(skills) {
    const completedSkills = skills.filter((s) => s.status === 'Atlikta');
    const totalXp = completedSkills.reduce((sum, s) => sum + Number(s.xp || 0), 0);
    const levelInfo = getLevelInfo(totalXp);

    const totalSkillsCount = skills.length;
    const completedCount = completedSkills.length;
    const completedPercent =
      totalSkillsCount > 0 ? Math.round((completedCount / totalSkillsCount) * 100) : 0;

    const xpEl = document.getElementById('total-xp-value');
    const levelEl = document.getElementById('level-value');
    const rankEl = document.getElementById('rank-value');
    const progressBarEl = document.getElementById('level-progress-bar');
    const progressTextEl = document.getElementById('level-progress-text');
    const statTotalEl = document.getElementById('stat-total-skills');
    const statCompletedEl = document.getElementById('stat-completed-skills');
    const statPercentEl = document.getElementById('stat-completed-percent');

    if (xpEl) xpEl.textContent = `${totalXp} XP`;
    if (levelEl) levelEl.textContent = String(levelInfo.level);
    if (rankEl) rankEl.textContent = levelInfo.rank;

    if (progressBarEl) {
      progressBarEl.style.width = `${levelInfo.progressPercent}%`;
      progressBarEl.setAttribute('aria-valuenow', String(levelInfo.progressPercent));
    }
    if (progressTextEl) {
      progressTextEl.textContent = `${levelInfo.progressPercent}%`;
    }

    if (statTotalEl) statTotalEl.textContent = String(totalSkillsCount);
    if (statCompletedEl) statCompletedEl.textContent = String(completedCount);
    if (statPercentEl) statPercentEl.textContent = `${completedPercent}%`;
  }

  const skillsState = loadSkills();

  function handleStatusChange(skillId, newStatus) {
    const target = skillsState.find((item) => item.id === skillId);
    if (!target || !STATUSES.includes(newStatus)) return;
    target.status = newStatus;
    saveStatuses(skillsState);
    renderKanbanCards(skillsState, handleStatusChange);
    updateProgressAndStats(skillsState);
  }

  renderKanbanCards(skillsState, handleStatusChange);
  updateProgressAndStats(skillsState);
});