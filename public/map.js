// public.map.js
class SpecialtyMap {
  constructor(mapDiv, clientId) {
    this.map = null;
    this.infoWindow = null;
    this.specialtyMarkers = [];
    this.regions = [
      {
        name: '경기도',
        lat: 37.7142,
        lng: 127.0292,
        specialties: [
          {
            name: '이천 쌀',
            lat: 37.272,
            lng: 127.435,
            url: 'http://www.traveli.co.kr/area/index/45',
          },
          { name: '안성 배', lat: 37.0081, lng: 127.2797 },
          { name: '포천 막걸리', lat: 37.8949, lng: 127.2003 },
          { name: '가평 잣', lat: 37.8315, lng: 127.5106 },
          { name: '양평 한우', lat: 37.4913, lng: 127.4875 },
        ],
      },
      {
        name: '강원도',
        lat: 37.8613,
        lng: 128.3115,
        specialties: [
          { name: '횡성 한우', lat: 37.4917, lng: 127.985 },
          { name: '강릉 초당두부', lat: 37.7556, lng: 128.8961 },
          { name: '양양 송이', lat: 38.0756, lng: 128.6189 },
          { name: '속초 오징어', lat: 38.207, lng: 128.5918 },
        ],
      },
      {
        name: '충청북도',
        lat: 36.8853,
        lng: 127.7298,
        specialties: [
          { name: '충주 사과', lat: 36.9911, lng: 127.9259 },
          { name: '청주 직지', lat: 36.6424, lng: 127.489 },
          { name: '보은 대추', lat: 36.4894, lng: 127.7292 },
          { name: '영동 포도', lat: 36.1746, lng: 127.7831 },
          { name: '괴산 고추', lat: 36.815, lng: 127.7868 },
        ],
      },
      {
        name: '충청남도',
        lat: 36.5184,
        lng: 126.8,
        specialties: [
          { name: '서산 마늘', lat: 36.7846, lng: 126.4503 },
          { name: '논산 딸기', lat: 36.1872, lng: 127.0987 },
          { name: '부여 연꽃', lat: 36.2758, lng: 126.9097 },
          { name: '예산 사과', lat: 36.6808, lng: 126.8444 },
          { name: '공주 밤', lat: 36.4464, lng: 127.1189 },
        ],
      },
      {
        name: '전라북도',
        lat: 35.7175,
        lng: 127.153,
        specialties: [
          { name: '순창 고추장', lat: 35.3743, lng: 127.1372 },
          { name: '고창 복분자', lat: 35.4358, lng: 126.702 },
          { name: '임실 치즈', lat: 35.6178, lng: 127.2792 },
          { name: '남원 추어탕', lat: 35.4164, lng: 127.3906 },
          { name: '전주 비빔밥', lat: 35.8242, lng: 127.148 },
        ],
      },
      {
        name: '전라남도',
        lat: 34.8679,
        lng: 126.991,
        specialties: [
          { name: '보성 녹차', lat: 34.7714, lng: 127.0799 },
          { name: '영광 굴비', lat: 35.2775, lng: 126.512 },
          { name: '담양 죽순', lat: 35.3214, lng: 126.9881 },
          { name: '나주 배', lat: 35.0159, lng: 126.7103 },
          { name: '여수 갓김치', lat: 34.7604, lng: 127.6622 },
        ],
      },
      {
        name: '경상북도',
        lat: 36.2893,
        lng: 128.8922,
        specialties: [
          { name: '안동 간고등어', lat: 36.5684, lng: 128.7294 },
          { name: '영덕 대게', lat: 36.4153, lng: 129.3656 },
          { name: '의성 마늘', lat: 36.3528, lng: 128.6969 },
          { name: '상주 곶감', lat: 36.4109, lng: 128.1589 },
          { name: '청도 감', lat: 35.6473, lng: 128.7338 },
        ],
      },
      {
        name: '경상남도',
        lat: 35.4606,
        lng: 128.2132,
        specialties: [
          { name: '진주 비빔밥', lat: 35.1795, lng: 128.1076 },
          { name: '남해 멸치', lat: 34.8376, lng: 127.8924 },
          { name: '하동 녹차', lat: 35.0674, lng: 127.7514 },
          { name: '밀양 대추', lat: 35.5037, lng: 128.7464 },
          { name: '통영 굴', lat: 34.8544, lng: 128.4333 },
        ],
      },
      {
        name: '제주도',
        lat: 33.3846,
        lng: 126.5534,
        specialties: [
          { name: '제주 감귤', lat: 33.25, lng: 126.4 },
          { name: '제주 흑돼지', lat: 33.4, lng: 126.54 },
          { name: '제주 한라봉', lat: 33.36, lng: 126.7 },
          { name: '제주 옥돔', lat: 33.51, lng: 126.51 },
          { name: '제주 녹차', lat: 33.3, lng: 126.29 },
        ],
      },
    ];

    this.loadNaverMapsScript(clientId).then(() => {
      this.initMap(mapDiv);
      this.addMarkers();
    });
  }

  loadNaverMapsScript(clientId) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  initMap(mapDiv) {
    this.map = new naver.maps.Map(mapDiv, {
      zoom: 7,
      center: new naver.maps.LatLng(36.5, 127.5),
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.SMALL,
        position: naver.maps.Position.TOP_RIGHT,
      },
      mapTypeControl: true,
      scaleControl: true,
      mapDataControl: true,
      minZoom: 6,
      maxZoom: 13,
    });

    this.infoWindow = new naver.maps.InfoWindow({
      content: '',
      maxWidth: 300,
      backgroundColor: '#fff',
      borderColor: '#2db400',
      borderWidth: 2,
      anchorSize: new naver.maps.Size(30, 30),
      anchorSkew: true,
      anchorColor: '#fff',
      pixelOffset: new naver.maps.Point(20, -20),
    });
  }

  addMarkers() {
    if (!this.map || !this.infoWindow) return;

    this.regions.forEach((region) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(region.lat, region.lng),
        map: this.map,
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        if (this.map) {
          this.map.setCenter(new naver.maps.LatLng(region.lat, region.lng));
          const zoomLevel = region.name === '제주도' ? 11 : 9;
          this.map.setZoom(zoomLevel);
        }
        this.showSpecialties(region);
      });
    });
  }

  showSpecialties(region) {
    this.clearSpecialtyMarkers();

    region.specialties.forEach((specialty) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(specialty.lat, specialty.lng),
        map: this.map,
        icon: {
          url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png',
          size: new naver.maps.Size(27, 43),
          origin: new naver.maps.Point(0, 0),
          anchor: new naver.maps.Point(13, 43),
        },
      });

      naver.maps.Event.addListener(marker, 'mouseover', () => {
        const content = `<div style="padding:5px;">${specialty.name}</div>`;
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
      });

      naver.maps.Event.addListener(marker, 'mouseout', () => {
        this.infoWindow.close();
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        if (specialty.url) {
          window.location.href = specialty.url;
        }
      });

      this.specialtyMarkers.push(marker);
    });
  }

  clearSpecialtyMarkers() {
    this.specialtyMarkers.forEach((marker) => marker.setMap(null));
    this.specialtyMarkers = [];
  }
}

const specialtyMap = new SpecialtyMap('map-container', 'wkccyoua6i');
