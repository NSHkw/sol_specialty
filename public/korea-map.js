document.addEventListener('DOMContentLoaded', function () {
  const regions = [
    {
      name: 'Gyeonggi',
      korName: '경기도',
      color: '#3498db',
      icon: '🏢',
      description: '대한민국의 수도권 중심지입니다.',
    },
    {
      name: 'Gangwon',
      korName: '강원도',
      color: '#e74c3c',
      icon: '⛰️',
      description: '아름다운 산과 바다가 있는 관광의 중심지입니다.',
    },
    {
      name: 'North Chungcheong',
      korName: '충청북도',
      color: '#f1c40f',
      icon: '🌄',
      description: '내륙 중심의 교통과 물류의 요충지입니다.',
    },
    {
      name: 'South Chungcheong',
      korName: '충청남도',
      color: '#27ae60',
      icon: '🌊',
      description: '서해안의 수산업과 농업이 발달한 지역입니다.',
    },
    {
      name: 'North Jeolla',
      korName: '전라북도',
      color: '#9b59b6',
      icon: '🍚',
      description: '한국 전통 음식의 본고장입니다.',
    },
    {
      name: 'South Jeolla',
      korName: '전라남도',
      color: '#e67e22',
      icon: '🌾',
      description: '비옥한 평야와 청정 해역을 보유한 지역입니다.',
    },
    {
      name: 'North Gyeongsang',
      korName: '경상북도',
      color: '#1abc9c',
      icon: '🗻',
      description: '한국의 전통문화와 역사가 살아있는 곳입니다.',
    },
    {
      name: 'South Gyeongsang',
      korName: '경상남도',
      color: '#d35400',
      icon: '🏖️',
      description: '항만 물류와 해양 관광의 중심지입니다.',
    },
    {
      name: 'Jeju',
      korName: '제주도',
      color: '#7f8c8d',
      icon: '🌴',
      description: '아름다운 자연과 독특한 문화가 있는 관광의 섬입니다.',
    },
  ];

  const metropolitanCities = [
    { id: 'KR-28', color: '#3498db' },
    { id: 'KR-30', color: '#27ae60' },
    { id: 'KR-29', color: '#e67e22' },
    { id: 'KR-27', color: '#1abc9c' },
    { id: 'KR-31', color: '#d35400' },
    { id: 'KR-26', color: '#d35400' },
  ];

  const leftList = document.querySelector('.region-list.left');
  const rightList = document.querySelector('.region-list.right');

  regions.forEach((region, index) => {
    const regionElement = `
      <div class="region-item" data-region="${region.name}">
        <div class="region-icon" style="background-color: ${region.color}">
          ${region.icon}
        </div>
        <div class="region-info">
          <div class="region-name">${region.korName}</div>
          <div class="region-desc">${region.description}</div>
        </div>
      </div>
    `;

    const listElement = index < regions.length / 2 ? leftList : rightList;
    listElement.innerHTML += regionElement;
  });

  const svgObject = document.getElementById('korea-map');
  svgObject.addEventListener('load', function () {
    const svgDoc = this.contentDocument;
    const paths = svgDoc.querySelectorAll('path');

    // SVG 지도 초기화
    paths.forEach((path) => {
      const pathId = path.getAttribute('id');
      const region = regions.find((r) => r.name === path.getAttribute('title'));
      const metro = metropolitanCities.find((m) => m.id === pathId);

      if (region) {
        path.style.fill = region.color;
        path.setAttribute('data-region', region.name);
      } else if (metro) {
        path.style.fill = metro.color;
        path.setAttribute('data-region', metro.id);
      }

      path.style.stroke = '#FFFFFF';
      path.style.strokeWidth = '1';

      // 지도 영역 호버 효과
      path.addEventListener('mouseover', function() {
        const originalColor = this.style.fill;
        this.setAttribute('data-original-color', originalColor);
        this.style.fill = '#FFFFFF';
      });

      path.addEventListener('mouseout', function() {
        const originalColor = this.getAttribute('data-original-color');
        this.style.fill = originalColor;
      });
    });

    // 지역 아이콘 호버 효과
    // 경기도 아이콘 영역에 대한 이벤트 리스너
document.querySelector('.region-item[data-region="Gyeonggi"]').addEventListener('mouseover', function() {
  const svgDoc = document.getElementById('korea-map').contentDocument;
  const path = svgDoc.querySelector('path[title="Gyeonggi"]');
  if (path) {
    path.setAttribute('data-original-color', path.style.fill);
    path.style.fill = '#FFFFFF';
  }
});

document.querySelector('.region-item[data-region="Gyeonggi"]').addEventListener('mouseout', function() {
  const svgDoc = document.getElementById('korea-map').contentDocument;
  const path = svgDoc.querySelector('path[title="Gyeonggi"]');
  if (path) {
    path.style.fill = path.getAttribute('data-original-color');
  }
});

    });
  });
