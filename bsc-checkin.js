require('dotenv').config();
const { Web3 } = require('web3'); // Правильный импорт для v4.x
const cron = require('node-cron');

if (!process.env.PRIVATE_KEY) {
    throw new Error('❌ Добавьте PRIVATE_KEY в .env файл');
}

const privateKey = process.env.PRIVATE_KEY.trim();
if (!/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error('❌ Ключ должен содержать 64 hex-символа');
}

const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${pri>

// Проверяем, что ключ валидный
let account;
try {
    account = new Web3().eth.accounts.privateKeyToAccount(formattedPrivateKey);
    console.log('✅ Ключ корректный. Адрес:', account.address);
} catch (e) {
    throw new Error('❌ Ошибка в приватном ключе: ' + e.message);
}


// Конфигурация
const CHECK_IN_CONTRACT_ADDRESS = '0xD615Eb3ea3DB2F994Dce7d471A02d521B8E1D22d';
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ABI для check-in функции
const CHECK_IN_ABI = [
    {
        "inputs": [],
        "name": "checkIn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Инициализация Web3 (правильно для v4.x)
const web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));

// Добавление аккаунта (новый синтаксис);
web3.eth.accounts.wallet.add(account);

// Контракт
const checkInContract = new web3.eth.Contract(CHECK_IN_ABI, CHECK_IN_CONTRACT_A>

async function performCheckIn() {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await checkInContract.methods.checkIn().estimateGas>
            from: account.address
        });
        const nonce = await web3.eth.getTransactionCount(account.address, 'pend>
        
        const tx = {
            from: account.address,
            to: CHECK_IN_CONTRACT_ADDRESS,
            gas: gasEstimate,
            gasPrice: gasPrice,
            data: checkInContract.methods.checkIn().encodeABI(),
            chainId: 56,
            nonce,
        };

        const signedTx = await account.signTransaction(tx);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransa>
        
        console.log(`Check-in успешен! Tx hash: ${receipt.transactionHash}`);
        return receipt;
    } catch (error) {
        console.error('Ошибка при check-in:', error);
        throw error;
    }
}

function getRandomTime() {
    // Генерируем случайное время между 00:00 и 23:59
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return { hour, minute };
}

function getNextDayRandomTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1); // Переходим на завтра
    tomorrow.setHours(0, 0, 0, 0); // Устанавливаем начало дня
    
    const { hour, minute } = getRandomTime();
    tomorrow.setHours(hour, minute, 0, 0); // Устанавливаем случайное время
    
    return tomorrow;
}

function scheduleNextCheckIn() {
    const nextRun = getNextDayRandomTime();
    const delay = nextRun.getTime() - Date.now();
    
    console.log(`⏰ Следующий check-in запланирован на ${nextRun.toISOString()}>
    
    // Очищаем предыдущий таймер, если был
    if (global.checkInTimer) {
        clearTimeout(global.checkInTimer);
    }
    
    global.checkInTimer = setTimeout(async () => {
        console.log(`🚀 Запуск check-in в ${new Date().toISOString()}`);
        try {
            await performCheckIn();
            // После успешного выполнения планируем следующий check-in на завтра
            scheduleNextCheckIn();
        } catch (err) {
            console.error('🔄 Повтор через 1 час из-за ошибки:', err.message);
            // При ошибке пробуем снова через час
            setTimeout(scheduleNextCheckIn, 60 * 60 * 1000);
        }
    }, delay);
}

console.log('🟢 Сервис автоматического check-in запущен');
scheduleNextCheckIn();

                                                                            
                                                                            
