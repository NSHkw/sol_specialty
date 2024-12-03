interface Region {
    name: string;
    color: string;
    specialties: string[];
}

class SpecialtyMap {
    private svgMap: SVGElement | null = null;
    private regions: Region[] = [
        { name: '경기도', color: '#2B7CB3', specialties: ['이천 쌀', '안성 배', '포천 막걸리', '가평 잣', '양평 한우'] },
        { name: '강원도', color: '#E44D61', specialties: ['횡성 한우', '강릉 초당두부', '양양 송이', '속초 오징어'] },
        { name: '충청북도', color: '#F7941D', specialties: ['충주 사과', '청주 직지', '보은 대추', '영동 포도', '괴산 고추'] },
        { name: '충청남도', color: '#8E2C8E', specialties: ['서산 마늘', '논산 딸기', '부여 연꽃', '예산 사과', '공주 밤'] },
        { name: '전라북도', color: '#404041', specialties: ['순창 고추장', '고창 복분자', '임실 치즈', '남원 추어탕', '전주 비빔밥'] },
        { name: '전라남도', color: '#662D91', specialties: ['보성 녹차', '영광 굴비', '담양 죽순', '나주 배', '여수 갓김치'] },
        { name: '경상북도', color: '#00A79D', specialties: ['안동 간고등어', '영덕 대게', '의성 마늘', '상주 곶감', '청도 감'] },
        { name: '경상남도', color: '#939598', specialties: ['진주 비빔밥', '남해 멸치', '하동 녹차', '밀양 대추', '통영 굴'] },
        { name: '제주도', color: '#808285', specialties: ['제주 감귤', '제주 흑돼지', '제주 한라봉', '제주 옥돔', '제주 녹차'] }
    ];

    constructor(containerId: string) {
        this.initMap(containerId);
    }

    private async initMap(containerId: string): Promise<void> {
        try {
            const response = await fetch('/images/south-korea.svg');
            const svgText = await response.text();
            
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = svgText;
                this.svgMap = container.querySelector('svg');
                
                if (this.svgMap) {
                    this.setupSvgStyles();
                    this.colorRegions();
                    this.addEventListeners();
                    this.addLegend();
                }
            }
        } catch (error) {
            console.error('지도를 불러오는데 실패했습니다:', error);
        }
    }

    private setupSvgStyles(): void {
        if (!this.svgMap) return;

        this.svgMap.style.width = '100%';
        this.svgMap.style.height = '100%';
        this.svgMap.style.position = 'absolute';
        this.svgMap.style.top = '0';
        this.svgMap.style.left = '0';

        const style = document.createElement('style');
        style.textContent = `
            path {
                transition: fill 0.3s ease;
                cursor: pointer;
            }
            path:hover {
                opacity: 0.8;
            }
        `;
        this.svgMap.appendChild(style);
    }

    private colorRegions(): void {
        if (!this.svgMap) return;

        const paths = this.svgMap.querySelectorAll('path');
        paths.forEach(path => {
            const region = this.regions.find(r => r.name === path.getAttribute('title'));
            if (region) {
                path.setAttribute('fill', region.color);
                path.setAttribute('stroke', '#FFFFFF');
                path.setAttribute('stroke-width', '1');
            }
        });
    }

    private addEventListeners(): void {
        if (!this.svgMap) return;

        const paths = this.svgMap.querySelectorAll('path');
        paths.forEach(path => {
            path.addEventListener('click', (e) => {
                const region = this.regions.find(r => r.name === path.getAttribute('title'));
                if (region) {
                    this.showSpecialties(region, e as MouseEvent);
                }
            });
        });

        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.info-window') && !target.closest('svg')) {
                this.closeInfoWindow();
            }
        });
    }

    private addLegend(): void {
        const legend = document.createElement('div');
        legend.className = 'map-legend';
        legend.innerHTML = `
            <h2>지역별 특산품</h2>
            <div class="legend-items">
                ${this.regions.map(region => `
                    <div class="legend-item">
                        <span class="color-box" style="background-color: ${region.color}"></span>
                        <span class="region-name">${region.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(legend);
    }

    private showSpecialties(region: Region, event: MouseEvent): void {
        this.closeInfoWindow();

        const infoWindow = document.createElement('div');
        infoWindow.className = 'info-window';
        infoWindow.innerHTML = `
            <div class="info-header">
                <h3>${region.name} 특산품</h3>
                <button class="close-button">&times;</button>
            </div>
            <ul>
                ${region.specialties.map(specialty => `<li>${specialty}</li>`).join('')}
            </ul>
        `;

        infoWindow.style.position = 'absolute';
        infoWindow.style.left = `${event.pageX + 10}px`;
        infoWindow.style.top = `${event.pageY + 10}px`;

        document.body.appendChild(infoWindow);

        const closeButton = infoWindow.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeInfoWindow());
        }
    }

    private closeInfoWindow(): void {
        const existingInfo = document.querySelector('.info-window');
        if (existingInfo) {
            existingInfo.remove();
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    
    #map-container {
        width: 100vw;
        height: 100vh;
        position: relative;
        background-color: #f5f5f5;
    }

    .map-legend {
        position: absolute;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    .legend-items {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .color-box {
        width: 15px;
        height: 15px;
        border-radius: 50%;
    }

    .region-name {
        font-size: 14px;
    }

    .info-window {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 200px;
    }

    .info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .info-window h3 {
        margin: 0;
        color: #333;
    }

    .info-window ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .info-window li {
        padding: 5px 0;
        border-bottom: 1px solid #eee;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
    }

    .close-button:hover {
        color: #666;
    }
`;
document.head.appendChild(style);

export default SpecialtyMap;