import { Version } from 'https://esm.sh/bysquare@4';
import { CurrencyCode, PaymentOptions, encode } from 'https://esm.sh/bysquare@4/pay';
import QRCode from 'https://esm.sh/qrcode@1.5.4';

(function () {
  const form = document.getElementById('waste-payment-form');
  if (!form) {
    return;
  }

  const summary = document.getElementById('waste-summary');
  const qrTarget = document.getElementById('waste-qr-code');
  const amountOutput = document.getElementById('summary-amount');
  const payerOutput = document.getElementById('summary-payer');
  const addressOutput = document.getElementById('summary-address');
  const binOutput = document.getElementById('summary-bin');
  const cycleOutput = document.getElementById('summary-cycle');
  const noteOutput = document.getElementById('summary-note');
  const cycleInputs = Array.from(form.querySelectorAll('input[name="collection-cycle"]'));
  const binInputs = Array.from(form.querySelectorAll('input[name="bin-size"]'));
  const priceBadges = Array.from(form.querySelectorAll('[data-role="bin-price"]'));

  const feeTable = {
    '26': { '110': 143.00, '120': 149.75, '240': 249.60 },
    '13': { '110': 128.70, '120': 132.60, '240': 193.45 }
  };

  function euro(amount) {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function toBankCompatibleText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getValue(name) {
    const field = form.elements[name];
    return field ? String(field.value || '').trim() : '';
  }

  function getSelectedCycle() {
    return form.querySelector('input[name="collection-cycle"]:checked');
  }

  function getSelectedBin() {
    return form.querySelector('input[name="bin-size"]:checked');
  }

  function getAmount() {
    const cycle = getSelectedCycle();
    const bin = getSelectedBin();
    if (!cycle || !bin) {
      return null;
    }
    return feeTable[cycle.value][bin.value];
  }

  const municipalityIban = 'SK1602000000005070519556';
  const variableSymbol = '6767';
  const constantSymbol = '0308';

  function buildPaymentPayload() {
    const name = getValue('first-name');
    const surname = getValue('last-name');
    const address = getValue('address');
    const cycle = getSelectedCycle();
    const bin = getSelectedBin();
    const amount = getAmount();
    const payer = (name + ' ' + surname).trim();
    const note = payer + ', ' + address;
    const bankNote = toBankCompatibleText(note).slice(0, 140);

    // VUB korektne nacita starsiu PAY by square hlavicku (spec 1.0.0) s jednoduchym payloadom.
    const qrText = encode({
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: amount,
          currencyCode: CurrencyCode.EUR,
          variableSymbol: variableSymbol,
          constantSymbol: constantSymbol,
          paymentNote: bankNote,
          beneficiary: { name: 'Obec Miloslavov' },
          bankAccounts: [{ iban: municipalityIban }]
        }
      ]
    }, {
      version: Version['1.0.0']
    });

    return {
      payer: payer,
      address: address,
      note: note,
      cycle: cycle.value,
      bin: bin.value,
      amount: amount,
      qrText: qrText
    };
  }

  function refreshPrices() {
    const cycle = getSelectedCycle();
    if (!cycle) {
      return;
    }
    priceBadges.forEach(function (badge) {
      const size = badge.dataset.size;
      const amount = feeTable[cycle.value][size];
      badge.textContent = euro(amount);
    });
  }

  cycleInputs.forEach(function (input) {
    input.addEventListener('change', refreshPrices);
  });
  binInputs.forEach(function (input) {
    input.addEventListener('change', refreshPrices);
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    let payload;
    try {
      payload = buildPaymentPayload();
    } catch (error) {
      window.alert('QR kód sa nepodarilo vygenerovať: ' + error.message);
      return;
    }

    const qrCodeImage = new window.Image();
    qrCodeImage.src = await QRCode.toDataURL(payload.qrText, {
      errorCorrectionLevel: 'M',
      margin: 6,
      width: 328,
      color: {
        dark: '#000000',
        light: '#FFFFFFFF'
      }
    });
    qrCodeImage.width = 328;
    qrCodeImage.height = 328;
    qrCodeImage.alt = 'QR kód PAY by square pre úhradu odpadu';
    qrCodeImage.decoding = 'async';

    qrTarget.replaceChildren(qrCodeImage);

    amountOutput.textContent = euro(payload.amount);
    payerOutput.textContent = payload.payer;
    addressOutput.textContent = payload.address;
    binOutput.textContent = payload.bin + ' l';
    cycleOutput.textContent = payload.cycle + ' vývozov ročne';
    noteOutput.textContent = payload.note;

    summary.classList.add('visible');
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  refreshPrices();
}());
