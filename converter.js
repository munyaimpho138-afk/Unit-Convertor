        // Unit Conversion Data
        const conversionData = {
            length: {
                units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
                conversions: {
                    meter: 1,
                    kilometer: 0.001,
                    centimeter: 100,
                    millimeter: 1000,
                    mile: 0.000621371,
                    yard: 1.09361,
                    foot: 3.28084,
                    inch: 39.3701
                }
            },
            weight: {
                units: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton'],
                conversions: {
                    kilogram: 1,
                    gram: 1000,
                    milligram: 1000000,
                    pound: 2.20462,
                    ounce: 35.274,
                    ton: 0.00110231
                }
            },
            temperature: {
                units: ['celsius', 'fahrenheit', 'kelvin'],
                conversions: {
                    celsius: 1,
                    fahrenheit: 33.8,
                    kelvin: 274.15
                }
            },
            area: {
                units: ['square meter', 'square kilometer', 'square mile', 'square yard', 'square foot', 'acre', 'hectare'],
                conversions: {
                    'square meter': 1,
                    'square kilometer': 0.000001,
                    'square mile': 0.000000386102,
                    'square yard': 1.19599,
                    'square foot': 10.7639,
                    'acre': 0.000247105,
                    'hectare': 0.0001
                }
            },
            volume: {
                units: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluid ounce', 'cubic meter'],
                conversions: {
                    liter: 1,
                    milliliter: 1000,
                    gallon: 0.264172,
                    quart: 1.05669,
                    pint: 2.11338,
                    cup: 4.22675,
                    'fluid ounce': 33.814,
                    'cubic meter': 0.001
                }
            },
            speed: {
                units: ['meter per second', 'kilometer per hour', 'mile per hour', 'knot', 'foot per second'],
                conversions: {
                    'meter per second': 1,
                    'kilometer per hour': 3.6,
                    'mile per hour': 2.23694,
                    'knot': 1.94384,
                    'foot per second': 3.28084
                }
            },
            time: {
                units: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
                conversions: {
                    second: 1,
                    minute: 1/60,
                    hour: 1/3600,
                    day: 1/86400,
                    week: 1/604800,
                    month: 1/2628000,
                    year: 1/31536000
                }
            },
            digital: {
                units: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'],
                conversions: {
                    byte: 1,
                    kilobyte: 0.001,
                    megabyte: 0.000001,
                    gigabyte: 0.000000001,
                    terabyte: 0.000000000001,
                    petabyte: 0.000000000000001
                }
            }
        };

        // DOM Elements
        const fromValueInput = document.getElementById('fromValue');
        const categorySelect = document.getElementById('category');
        const fromUnitSelect = document.getElementById('fromUnit');
        const toUnitSelect = document.getElementById('toUnit');
        const resultValue = document.getElementById('resultValue');
        const resultUnit = document.getElementById('resultUnit');
        const formulaDisplay = document.getElementById('formulaDisplay');
        const swapBtn = document.getElementById('swapBtn');
        const clearHistoryBtn = document.getElementById('clearHistory');
        const historyList = document.getElementById('historyList');
        const quickConversionCards = document.querySelectorAll('.quick-conversion-card');

        // Initialize
        let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];

        // Populate unit selects
        function populateUnitSelects() {
            const category = categorySelect.value;
            const units = conversionData[category].units;
            
            // Clear current options
            fromUnitSelect.innerHTML = '';
            toUnitSelect.innerHTML = '';
            
            // Add new options
            units.forEach(unit => {
                const fromOption = document.createElement('option');
                fromOption.value = unit;
                fromOption.textContent = unit;
                fromUnitSelect.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = unit;
                toOption.textContent = unit;
                toUnitSelect.appendChild(toOption);
            });
            
            // Set default to unit (second unit in list)
            if (units.length > 1) {
                toUnitSelect.value = units[1];
            }
            
            updateConversion();
        }

        // Temperature conversion (special case)
        function convertTemperature(value, fromUnit, toUnit) {
            let celsius;
            
            // Convert to Celsius first
            switch(fromUnit) {
                case 'celsius':
                    celsius = value;
                    break;
                case 'fahrenheit':
                    celsius = (value - 32) * 5/9;
                    break;
                case 'kelvin':
                    celsius = value - 273.15;
                    break;
            }
            
            // Convert from Celsius to target unit
            switch(toUnit) {
                case 'celsius':
                    return celsius;
                case 'fahrenheit':
                    return (celsius * 9/5) + 32;
                case 'kelvin':
                    return celsius + 273.15;
            }
        }

        // Convert units
        function convertUnits(value, fromUnit, toUnit, category) {
            if (category === 'temperature') {
                return convertTemperature(value, fromUnit, toUnit);
            }
            
            const fromFactor = conversionData[category].conversions[fromUnit];
            const toFactor = conversionData[category].conversions[toUnit];
            
            // Convert to base unit first, then to target unit
            const baseValue = value / fromFactor;
            return baseValue * toFactor;
        }

        // Update conversion
        function updateConversion() {
            const value = parseFloat(fromValueInput.value) || 0;
            const category = categorySelect.value;
            const fromUnit = fromUnitSelect.value;
            const toUnit = toUnitSelect.value;
            
            let result;
            
            if (category === 'temperature') {
                result = convertTemperature(value, fromUnit, toUnit);
            } else {
                result = convertUnits(value, fromUnit, toUnit, category);
            }
            
            // Format result
            const formattedResult = formatNumber(result);
            resultValue.textContent = formattedResult;
            resultUnit.textContent = toUnit;
            
            // Update formula display
            updateFormulaDisplay(value, fromUnit, result, toUnit);
            
            // Add to history
            addToHistory(value, fromUnit, result, toUnit, category);
            
            // Update quick conversion cards
            updateQuickConversions();
        }

        // Format number
        function formatNumber(num) {
            if (num === 0) return '0';
            
            // For very small numbers
            if (Math.abs(num) < 0.000001) {
                return num.toExponential(6);
            }
            
            // For very large numbers
            if (Math.abs(num) > 1000000) {
                return num.toExponential(6);
            }
            
            // For regular numbers
            const rounded = Math.round(num * 1000000) / 1000000;
            
            // Remove trailing zeros
            return parseFloat(rounded.toFixed(6)).toString();
        }

        // Update formula display
        function updateFormulaDisplay(value, fromUnit, result, toUnit) {
            const category = categorySelect.value;
            
            if (category === 'temperature') {
                if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
                    formulaDisplay.value = `${value}°C × (9/5) + 32 = ${formatNumber(result)}°F`;
                } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
                    formulaDisplay.value = `(${value}°F - 32) × 5/9 = ${formatNumber(result)}°C`;
                } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
                    formulaDisplay.value = `${value}°C + 273.15 = ${formatNumber(result)}K`;
                } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
                    formulaDisplay.value = `${value}K - 273.15 = ${formatNumber(result)}°C`;
                } else {
                    formulaDisplay.value = `${value} ${fromUnit} → ${formatNumber(result)} ${toUnit}`;
                }
            } else {
                const fromFactor = conversionData[category].conversions[fromUnit];
                const toFactor = conversionData[category].conversions[toUnit];
                const conversionFactor = toFactor / fromFactor;
                
                formulaDisplay.value = `${value} ${fromUnit} × ${formatNumber(conversionFactor)} = ${formatNumber(result)} ${toUnit}`;
            }
        }

        // Add conversion to history
        function addToHistory(value, fromUnit, result, toUnit, category) {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                value: value,
                fromUnit: fromUnit,
                result: result,
                toUnit: toUnit,
                category: category
            };
            
            // Add to beginning of array
            conversionHistory.unshift(historyItem);
            
            // Keep only last 10 items
            if (conversionHistory.length > 10) {
                conversionHistory = conversionHistory.slice(0, 10);
            }
            
            // Save to localStorage
            localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
            
            // Update history display
            updateHistoryDisplay();
        }

        // Update history display
        function updateHistoryDisplay() {
            historyList.innerHTML = '';
            
            if (conversionHistory.length === 0) {
                historyList.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: var(--gray);">
                        <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        <p>No conversion history yet</p>
                        <p style="font-size: 0.9rem;">Your conversions will appear here</p>
                    </div>
                `;
                return;
            }
            
            conversionHistory.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-conversion">
                        <div class="history-value">${formatNumber(item.value)} ${item.fromUnit} → ${formatNumber(item.result)} ${item.toUnit}</div>
                        <div class="history-units">${item.category.charAt(0).toUpperCase() + item.category.slice(1)} Conversion</div>
                    </div>
                    <div class="history-time">${item.timestamp}</div>
                    <button class="delete-history" onclick="deleteHistoryItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                historyList.appendChild(historyItem);
            });
        }

        // Delete history item
        function deleteHistoryItem(id) {
            conversionHistory = conversionHistory.filter(item => item.id !== id);
            localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
            updateHistoryDisplay();
        }

        // Clear all history
        function clearHistory() {
            if (conversionHistory.length === 0) return;
            
            if (confirm('Are you sure you want to clear all conversion history?')) {
                conversionHistory = [];
                localStorage.removeItem('conversionHistory');
                updateHistoryDisplay();
            }
        }

        // Swap units
        function swapUnits() {
            const tempUnit = fromUnitSelect.value;
            fromUnitSelect.value = toUnitSelect.value;
            toUnitSelect.value = tempUnit;
            updateConversion();
        }



        // Event Listeners
        fromValueInput.addEventListener('input', updateConversion);
        categorySelect.addEventListener('change', populateUnitSelects);
        fromUnitSelect.addEventListener('change', updateConversion);
        toUnitSelect.addEventListener('change', updateConversion);
        swapBtn.addEventListener('click', swapUnits);
        clearHistoryBtn.addEventListener('click', clearHistory);

        // Initialize
        populateUnitSelects();
        updateHistoryDisplay();
        setupQuickConversions();

        // Auto-update every 2 seconds if input has changed
        let lastValue = fromValueInput.value;
        setInterval(() => {
            if (fromValueInput.value !== lastValue) {
                lastValue = fromValueInput.value;
                updateConversion();
            }
        }, 2000);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + S to swap
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                swapUnits();
            }
            
            // Ctrl + H to clear history
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                clearHistory();
            }
            
            // Escape to reset value to 1
            if (e.key === 'Escape') {
                fromValueInput.value = '1';
                updateConversion();
                fromValueInput.focus();
                fromValueInput.select();
            }
        });

        // Show keyboard shortcuts on first visit
        if (!localStorage.getItem('shortcutsShown')) {
            setTimeout(() => {
                alert('Keyboard shortcuts:\n• Ctrl+S: Swap units\n• Ctrl+H: Clear history\n• Escape: Reset to 1\n\nThese shortcuts make conversion faster!');
                localStorage.setItem('shortcutsShown', 'true');
            }, 1000);
        }