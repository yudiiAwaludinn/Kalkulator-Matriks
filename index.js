document.addEventListener('DOMContentLoaded', function() {
    // State variables
    let currentOperation = 'add';
    let matrixA = {
        rows: 2,
        cols: 2,
        values: [[0, 0], [0, 0]]
    };
    let matrixB = {
        rows: 2,
        cols: 2,
        values: [[0, 0], [0, 0]]
    };
    
    // DOM Elements
    const matrixAInput = document.getElementById('matrixAInput');
    const matrixBInput = document.getElementById('matrixBInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const selectedMatrix = document.getElementById('selectedMatrix');
    const fractionResult = document.getElementById('fractionResult');
    const decimalResult = document.getElementById('decimalResult');
    const resultInfo = document.getElementById('resultInfo');
    
    // ========== FUNGSI PEMBANTU ==========
    function gcd(a, b) {
        if (b === 0) return a;
        return gcd(b, a % b);
    }

    function simplifyFraction(numerator, denominator) {
        if (denominator === 0) return { numerator: 0, denominator: 1 };
        if (numerator === 0) return { numerator: 0, denominator: 1 };
        
        const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
        numerator = numerator / divisor;
        denominator = denominator / divisor;
        
        if (denominator < 0) {
            numerator = -numerator;
            denominator = -denominator;
        }
        
        return { numerator, denominator };
    }

    function decimalToFraction(decimal) {
        const tolerance = 1.0E-6;
        let numerator = 1;
        let denominator = 1;
        let fraction = numerator / denominator;
        
        while (Math.abs(fraction - decimal) > tolerance) {
            if (fraction < decimal) {
                numerator++;
            } else {
                denominator++;
                numerator = Math.round(decimal * denominator);
            }
            fraction = numerator / denominator;
        }
        
        return simplifyFraction(numerator, denominator);
    }
    
    function formatFraction(numerator, denominator) {
        if (denominator === 1) {
            return `<div class="whole-number">${numerator}</div>`;
        }
        
        return `<div class="fraction-display">
            <div class="fraction-numerator">${numerator}</div>
            <div class="fraction-denominator">${denominator}</div>
        </div>`;
    }
    
    // ========== INISIALISASI ==========
    createMatrixInput('A', matrixA.rows, matrixA.cols);
    createMatrixInput('B', matrixB.rows, matrixB.cols);
    
    // Set nilai contoh
    initializeSampleValues();
    
    // ========== EVENT LISTENERS ==========
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const matrixType = this.getAttribute('data-matrix');
            const size = this.getAttribute('data-size');
            
            document.querySelectorAll(`.size-btn[data-matrix="${matrixType}"]`).forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const rows = parseInt(size.split('x')[0]);
            const cols = parseInt(size.split('x')[1]);
            
            if (matrixType === 'A') {
                updateMatrixSize('A', rows, cols);
                document.getElementById('rowsA').value = rows;
                document.getElementById('colsA').value = cols;
            } else {
                updateMatrixSize('B', rows, cols);
                document.getElementById('rowsB').value = rows;
                document.getElementById('colsB').value = cols;
            }
        });
    });
    
    document.getElementById('rowsA').addEventListener('change', function() {
        const rows = parseInt(this.value);
        const cols = parseInt(document.getElementById('colsA').value);
        updateMatrixSize('A', rows, cols);
    });
    
    document.getElementById('colsA').addEventListener('change', function() {
        const rows = parseInt(document.getElementById('rowsA').value);
        const cols = parseInt(this.value);
        updateMatrixSize('A', rows, cols);
    });
    
    document.getElementById('rowsB').addEventListener('change', function() {
        const rows = parseInt(this.value);
        const cols = parseInt(document.getElementById('colsB').value);
        updateMatrixSize('B', rows, cols);
    });
    
    document.getElementById('colsB').addEventListener('change', function() {
        const rows = parseInt(document.getElementById('rowsB').value);
        const cols = parseInt(this.value);
        updateMatrixSize('B', rows, cols);
    });
    
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.operation-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentOperation = this.getAttribute('data-operation');
        });
    });
    
    document.getElementById('clearA').addEventListener('click', function() {
        clearMatrix('A');
    });
    
    document.getElementById('clearB').addEventListener('click', function() {
        clearMatrix('B');
    });
    
    calculateBtn.addEventListener('click', performCalculation);
    
    // ========== FUNGSI UTAMA ==========
    function createMatrixInput(matrixType, rows, cols) {
        const container = matrixType === 'A' ? matrixAInput : matrixBInput;
        const matrix = matrixType === 'A' ? matrixA : matrixB;
        
        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'matrix-grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-cell';
                input.value = matrix.values[i] && matrix.values[i][j] ? matrix.values[i][j] : 0;
                input.setAttribute('data-row', i);
                input.setAttribute('data-col', j);
                input.setAttribute('data-matrix', matrixType);
                
                input.addEventListener('input', function() {
                    const row = parseInt(this.getAttribute('data-row'));
                    const col = parseInt(this.getAttribute('data-col'));
                    const value = parseFloat(this.value) || 0;
                    
                    if (matrixType === 'A') {
                        if (!matrixA.values[row]) matrixA.values[row] = [];
                        matrixA.values[row][col] = value;
                    } else {
                        if (!matrixB.values[row]) matrixB.values[row] = [];
                        matrixB.values[row][col] = value;
                    }
                });
                
                grid.appendChild(input);
            }
        }
        
        container.appendChild(grid);
    }
    
    function updateMatrixSize(matrixType, rows, cols) {
        const matrix = matrixType === 'A' ? matrixA : matrixB;
        
        matrix.rows = rows;
        matrix.cols = cols;
        
        if (!matrix.values || matrix.values.length !== rows) {
            matrix.values = new Array(rows);
        }
        
        for (let i = 0; i < rows; i++) {
            if (!matrix.values[i] || matrix.values[i].length !== cols) {
                matrix.values[i] = new Array(cols);
            }
            
            for (let j = 0; j < cols; j++) {
                if (matrix.values[i][j] === undefined) {
                    matrix.values[i][j] = 0;
                }
            }
        }
        
        createMatrixInput(matrixType, rows, cols);
    }
    
    function clearMatrix(matrixType) {
        const matrix = matrixType === 'A' ? matrixA : matrixB;
        
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                matrix.values[i][j] = 0;
            }
        }
        
        createMatrixInput(matrixType, matrix.rows, matrix.cols);
        showSuccess(`Matriks ${matrixType} telah dikosongkan`);
    }
    
    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }
    
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.classList.remove('pulse');
        void errorMessage.offsetWidth;
        errorMessage.classList.add('pulse');
    }
    
    function showSuccess(message) {
        successText.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        successMessage.classList.remove('pulse');
        void successMessage.offsetWidth;
        successMessage.classList.add('pulse');
    }
    
    // ========== FUNGSI MATEMATIKA ==========
    function addMatrices(mat1, mat2) {
        const result = {
            rows: mat1.rows,
            cols: mat1.cols,
            values: []
        };
        
        for (let i = 0; i < mat1.rows; i++) {
            result.values[i] = [];
            for (let j = 0; j < mat1.cols; j++) {
                result.values[i][j] = mat1.values[i][j] + mat2.values[i][j];
            }
        }
        
        return result;
    }
    
    function subtractMatrices(mat1, mat2) {
        const result = {
            rows: mat1.rows,
            cols: mat1.cols,
            values: []
        };
        
        for (let i = 0; i < mat1.rows; i++) {
            result.values[i] = [];
            for (let j = 0; j < mat1.cols; j++) {
                result.values[i][j] = mat1.values[i][j] - mat2.values[i][j];
            }
        }
        
        return result;
    }
    
    function multiplyMatrices(mat1, mat2) {
        const result = {
            rows: mat1.rows,
            cols: mat2.cols,
            values: []
        };
        
        for (let i = 0; i < mat1.rows; i++) {
            result.values[i] = [];
            for (let j = 0; j < mat2.cols; j++) {
                let sum = 0;
                for (let k = 0; k < mat1.cols; k++) {
                    sum += mat1.values[i][k] * mat2.values[k][j];
                }
                result.values[i][j] = sum;
            }
        }
        
        return result;
    }
    
    function calculateDeterminant(mat) {
        if (mat.rows === 2 && mat.cols === 2) {
            return mat.values[0][0] * mat.values[1][1] - mat.values[0][1] * mat.values[1][0];
        } else if (mat.rows === 3 && mat.cols === 3) {
            const a = mat.values[0][0], b = mat.values[0][1], c = mat.values[0][2];
            const d = mat.values[1][0], e = mat.values[1][1], f = mat.values[1][2];
            const g = mat.values[2][0], h = mat.values[2][1], i = mat.values[2][2];
            
            return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
        }
        return 0;
    }
    
    function calculateInverse(mat) {
        const det = calculateDeterminant(mat);
        
        if (mat.rows === 2 && mat.cols === 2) {
            const a = mat.values[0][0], b = mat.values[0][1];
            const c = mat.values[1][0], d = mat.values[1][1];
            
            return {
                rows: 2,
                cols: 2,
                values: [
                    [d/det, -b/det],
                    [-c/det, a/det]
                ]
            };
        } else if (mat.rows === 3 && mat.cols === 3) {
            const a = mat.values[0][0], b = mat.values[0][1], c = mat.values[0][2];
            const d = mat.values[1][0], e = mat.values[1][1], f = mat.values[1][2];
            const g = mat.values[2][0], h = mat.values[2][1], i = mat.values[2][2];
            
            const cofactor = [
                [e*i - f*h, -(d*i - f*g), d*h - e*g],
                [-(b*i - c*h), a*i - c*g, -(a*h - b*g)],
                [b*f - c*e, -(a*f - c*d), a*e - b*d]
            ];
            
            const result = {
                rows: 3,
                cols: 3,
                values: []
            };
            
            for (let row = 0; row < 3; row++) {
                result.values[row] = [];
                for (let col = 0; col < 3; col++) {
                    result.values[row][col] = cofactor[col][row] / det;
                }
            }
            
            return result;
        }
        
        return null;
    }
    
    function transposeMatrix(mat) {
        const result = {
            rows: mat.cols,
            cols: mat.rows,
            values: []
        };
        
        for (let i = 0; i < mat.cols; i++) {
            result.values[i] = [];
            for (let j = 0; j < mat.rows; j++) {
                result.values[i][j] = mat.values[j][i];
            }
        }
        
        return result;
    }
    
    // ========== TAMPILAN HASIL ==========
    function displayResult(result, operationText) {
        // Kosongkan hasil sebelumnya
        fractionResult.innerHTML = '';
        decimalResult.innerHTML = '';
        resultInfo.innerHTML = '';
        
        // Tampilkan pecahan
        displayFractionResult(result);
        
        // Tampilkan desimal
        displayDecimalResult(result);
        
        // Tampilkan info
        displayResultInfo(result, operationText);
    }
    
    function displayFractionResult(result) {
        if (result.rows === 1 && result.cols === 1 && currentOperation === 'determinant') {
            // Untuk determinan
            const valueDiv = document.createElement('div');
            valueDiv.style.textAlign = 'center';
            
            const valueBox = document.createElement('div');
            valueBox.style.width = '120px';
                        valueBox.style.height = '80px';
            valueBox.style.margin = '0 auto';
            valueBox.style.display = 'flex';
            valueBox.style.alignItems = 'center';
            valueBox.style.justifyContent = 'center';
            
            const frac = decimalToFraction(result.values[0][0]);
            valueBox.innerHTML = formatFraction(frac.numerator, frac.denominator);
            
            valueDiv.appendChild(valueBox);
            fractionResult.appendChild(valueDiv);
        } else {
            // Untuk matriks
            const grid = document.createElement('div');
            grid.className = 'result-grid';
            grid.style.gridTemplateColumns = `repeat(${result.cols}, 1fr)`;
            
            for (let i = 0; i < result.rows; i++) {
                for (let j = 0; j < result.cols; j++) {
                    const cell = document.createElement('div');
                    cell.style.width = '80px';
                    cell.style.height = '70px';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.padding = '5px';
                    
                    const frac = decimalToFraction(result.values[i][j]);
                    cell.innerHTML = formatFraction(frac.numerator, frac.denominator);
                    
                    grid.appendChild(cell);
                }
            }
            
            fractionResult.appendChild(grid);
        }
    }
    
    function displayDecimalResult(result) {
        if (result.rows === 1 && result.cols === 1 && currentOperation === 'determinant') {
            // Untuk determinan
            const valueDiv = document.createElement('div');
            valueDiv.style.textAlign = 'center';
            
            const valueBox = document.createElement('div');
            valueBox.className = 'decimal-cell';
            valueBox.style.width = '120px';
            valueBox.style.height = '80px';
            valueBox.style.margin = '0 auto';
            
            valueBox.textContent = result.values[0][0].toFixed(4);
            
            valueDiv.appendChild(valueBox);
            decimalResult.appendChild(valueDiv);
        } else {
            // Untuk matriks
            const grid = document.createElement('div');
            grid.className = 'result-grid';
            grid.style.gridTemplateColumns = `repeat(${result.cols}, 1fr)`;
            
            for (let i = 0; i < result.rows; i++) {
                for (let j = 0; j < result.cols; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'decimal-cell';
                    cell.textContent = result.values[i][j].toFixed(4);
                    
                    grid.appendChild(cell);
                }
            }
            
            decimalResult.appendChild(grid);
        }
    }
    
    function displayResultInfo(result, operationText) {
        const operationLabel = document.createElement('div');
        operationLabel.className = 'operation-label';
        operationLabel.textContent = operationText;
        
        const sizeLabel = document.createElement('div');
        sizeLabel.className = 'size-label';
        sizeLabel.textContent = `Ukuran: ${result.rows} × ${result.cols}`;
        
        const successLabel = document.createElement('div');
        successLabel.className = 'success-label';
        
        if (currentOperation === 'inverse') {
            successLabel.textContent = `✓ Perhitungan Invers Matriks ${selectedMatrix.value} berhasil!`;
        } else if (currentOperation === 'determinant') {
            successLabel.textContent = `✓ Perhitungan Determinan Matriks ${selectedMatrix.value} berhasil!`;
        } else if (currentOperation === 'transpose') {
            successLabel.textContent = `✓ Perhitungan Transpos Matriks ${selectedMatrix.value} berhasil!`;
        } else {
            successLabel.textContent = `✓ Perhitungan ${operationText} berhasil!`;
        }
        
        resultInfo.appendChild(operationLabel);
        resultInfo.appendChild(sizeLabel);
        resultInfo.appendChild(successLabel);
        resultInfo.classList.add('fade-in');
    }
    
    function performCalculation() {
        hideMessages();
        
        try {
            let result;
            let operationText = '';
            
            switch(currentOperation) {
                case 'add':
                    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
                        throw new Error('Ukuran matriks A dan B harus sama untuk penjumlahan');
                    }
                    
                    result = addMatrices(matrixA, matrixB);
                    operationText = 'Penjumlahan Matriks A + B';
                    break;
                    
                case 'subtract':
                    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
                        throw new Error('Ukuran matriks A dan B harus sama untuk pengurangan');
                    }
                    
                    result = subtractMatrices(matrixA, matrixB);
                    operationText = 'Pengurangan Matriks A - B';
                    break;
                    
                case 'multiply':
                    if (matrixA.cols !== matrixB.rows) {
                        throw new Error('Jumlah kolom matriks A harus sama dengan jumlah baris matriks B untuk perkalian');
                    }
                    
                    result = multiplyMatrices(matrixA, matrixB);
                    operationText = 'Perkalian Matriks A × B';
                    break;
                    
                case 'determinant':
                    const matrixForDet = selectedMatrix.value === 'A' ? matrixA : matrixB;
                    if (matrixForDet.rows !== matrixForDet.cols) {
                        throw new Error('Matriks harus persegi (jumlah baris = jumlah kolom) untuk menghitung determinan');
                    }
                    
                    if (matrixForDet.rows > 3) {
                        throw new Error('Kalkulator ini hanya mendukung determinan matriks hingga 3x3');
                    }
                    
                    const det = calculateDeterminant(matrixForDet);
                    result = {
                        rows: 1,
                        cols: 1,
                        values: [[det]]
                    };
                    operationText = `Determinan Matriks ${selectedMatrix.value}`;
                    break;
                    
                case 'inverse':
                    const matrixForInv = selectedMatrix.value === 'A' ? matrixA : matrixB;
                    if (matrixForInv.rows !== matrixForInv.cols) {
                        throw new Error('Matriks harus persegi (jumlah baris = jumlah kolom) untuk menghitung invers');
                    }
                    
                    if (matrixForInv.rows > 3) {
                        throw new Error('Kalkulator ini hanya mendukung invers matriks hingga 3x3');
                    }
                    
                    const detForInv = calculateDeterminant(matrixForInv);
                    if (detForInv === 0) {
                        throw new Error('Matriks tidak memiliki invers karena determinannya 0');
                    }
                    
                    result = calculateInverse(matrixForInv);
                    operationText = `Invers Matriks ${selectedMatrix.value}`;
                    break;
                    
                case 'transpose':
                    const matrixForTrans = selectedMatrix.value === 'A' ? matrixA : matrixB;
                    result = transposeMatrix(matrixForTrans);
                    operationText = `Transpos Matriks ${selectedMatrix.value}`;
                    break;
                    
                default:
                    throw new Error('Operasi tidak dikenali');
            }
            
            displayResult(result, operationText);
            showSuccess(`Perhitungan ${operationText} berhasil!`);
            
        } catch (error) {
            showError(error.message);
            console.error(error);
        }
    }
    
    function initializeSampleValues() {
        // Sample values untuk Kelompok 2
        matrixA.values = [[0, 0, 0], [0, 0, 0]];
        matrixB.values = [[1, 0, 0], [0, 0, 0]];
        
        // Set ukuran ke 3x3
        updateMatrixSize('A', 2, 2);
        updateMatrixSize('B', 2, 2);
        
        // Update dropdowns
        document.getElementById('rowsA').value = 2;
        document.getElementById('colsA').value = 2;
        document.getElementById('rowsB').value = 2;
        document.getElementById('colsB').value = 2;
        
        // Update tombol aktif
        document.querySelectorAll('.size-btn[data-size="2x2"]').forEach(btn => {
            document.querySelectorAll(`.size-btn[data-matrix="${btn.getAttribute('data-matrix')}"]`).forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    }
    
    // Animasi pada load
    setTimeout(() => {
        const cells = document.querySelectorAll('.matrix-cell');
        cells.forEach((cell, index) => {
            cell.style.transitionDelay = `${index * 0.02}s`;
            cell.style.transform = 'scale(1.05)';
            setTimeout(() => {
                cell.style.transform = 'scale(1)';
            }, 300);
        });
    }, 500);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            calculateBtn.click();
        }
        
        if (event.key === 'Escape') {
            fractionResult.innerHTML = '<div class="result-placeholder">Hasil operasi akan ditampilkan di sini</div>';
            decimalResult.innerHTML = '<div class="result-placeholder">Hasil operasi akan ditampilkan di sini</div>';
            resultInfo.innerHTML = '';
            hideMessages();
        }
    });
});