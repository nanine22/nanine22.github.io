class AnalogMeter {
    constructor() {
        this.needle = document.getElementById('needle');
        this.measurementType = document.getElementById('measurementType');
        this.rangeSelector = document.getElementById('rangeSelector');
        this.measuredValue = document.getElementById('measuredValue');
        this.needlePosition = document.getElementById('needlePosition');
        this.currentRange = document.getElementById('currentRange');
        this.resolution = document.getElementById('resolution');
        
        this.currentAngle = -90; // เริ่มที่ 0
        this.maxAngle = 90; // มุมสูงสุด 180 องศา
        this.minAngle = -90; // มุมต่ำสุด
        this.isDragging = false;
        
        this.ranges = {
            voltage: {
                '10': { max: 10, unit: 'V', accuracy: 2 },
                '50': { max: 50, unit: 'V', accuracy: 2 },
                '250': { max: 250, unit: 'V', accuracy: 2 }
            },
            current: {
                '1': { max: 1, unit: 'A', accuracy: 2 },
                '10': { max: 10, unit: 'A', accuracy: 2 },
                '50': { max: 50, unit: 'mA', accuracy: 2 }
            },
            resistance: {
                '100': { max: 100, unit: 'Ω', accuracy: 3 },
                '1000': { max: 1000, unit: 'Ω', accuracy: 3 },
                '10000': { max: 10000, unit: 'Ω', accuracy: 3 }
            }
        };

        this.init();
    }

    init() {
        this.createScale();
        this.bindEvents();
        this.updateDisplay();
        this.updateRangeOptions();
    }

    createScale() {
        const scaleContainer = document.getElementById('scaleContainer');
        scaleContainer.innerHTML = '';

        // สร้างเส้นสเคลและตัวเลข
        for (let i = 0; i <= 50; i++) {
            const angle = -90 + (i * 3.6); // 180 องศา / 50 = 3.6 องศาต่อช่อง
            
            const line = document.createElement('div');
            line.className = i % 10 === 0 ? 'scale-line major' : 'scale-line minor';
            line.style.transform = `rotate(${angle}deg)`;
            scaleContainer.appendChild(line);

            // ใส่ตัวเลขทุก 10 ช่อง
            if (i % 10 === 0) {
                const number = document.createElement('div');
                number.className = 'scale-number';
                
                const radius = 120;
                const radian = (angle * Math.PI) / 180;
                const x = 200 + radius * Math.sin(radian);
                const y = 280 + radius * Math.cos(radian);
                
                number.style.left = `${x}px`;
                number.style.top = `${y}px`;
                number.textContent = i;
                
                scaleContainer.appendChild(number);
            }
        }
    }

    bindEvents() {
        // Mouse events
        this.needle.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Touch events for mobile
        this.needle.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // Control events
        this.measurementType.addEventListener('change', () => {
            this.updateRangeOptions();
            this.updateDisplay();
        });

        this.rangeSelector.addEventListener('change', () => {
            this.updateDisplay();
        });
    }

    handleDrag(event) {
        const meterFace = document.getElementById('meterFace');
        const rect = meterFace.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.bottom - 20; // จุดศูนย์กลางของเข็ม

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let angle = Math.atan2(mouseX - centerX, centerY - mouseY) * (180 / Math.PI);
        
        // จำกัดมุมให้อยู่ในช่วงที่กำหนด
        angle = Math.max(this.minAngle, Math.min(this.maxAngle, angle));
        
        this.currentAngle = angle;
        this.needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        this.updateDisplay();
    }

    updateRangeOptions() {
        const type = this.measurementType.value;
        const ranges = this.ranges[type];
        
        this.rangeSelector.innerHTML = '';
        
        Object.keys(ranges).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            
            if (type === 'voltage') {
                option.textContent = `0-${key}V`;
            } else if (type === 'current') {
                option.textContent = `0-${key}${ranges[key].unit}`;
            } else if (type === 'resistance') {
                option.textContent = `0-${key}Ω`;
            }
            
            this.rangeSelector.appendChild(option);
        });
    }

    updateDisplay() {
        const type = this.measurementType.value;
        const range = this.rangeSelector.value;
        const rangeData = this.ranges[type][range];
        
        // คำนวณค่าจากมุมเข็ม
        const normalizedAngle = (this.currentAngle - this.minAngle) / (this.maxAngle - this.minAngle);
        const rawValue = normalizedAngle * rangeData.max;
        
        // ความละเอียด (50 ช่องแบ่ง)
        const resolutionValue = rangeData.max / 50;
        const quantizedValue = Math.round(rawValue / resolutionValue) * resolutionValue;
        
        // อัปเดตการแสดงผล
        this.measuredValue.textContent = `${quantizedValue.toFixed(2)} ${rangeData.unit}`;
        this.needlePosition.textContent = `${this.currentAngle.toFixed(1)}°`;
        this.currentRange.textContent = `0-${range}${rangeData.unit}`;
        this.resolution.textContent = `${resolutionValue.toFixed(2)} ${rangeData.unit}`;
    }
}

// เริ่มต้นมิเตอร์เมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    new AnalogMeter();
});