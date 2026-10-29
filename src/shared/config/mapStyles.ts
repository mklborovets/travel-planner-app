import {MapStyleElement} from 'react-native-maps';

export const STANDARD_MAP_STYLE: MapStyleElement[] = [];

export const DARK_MAP_STYLE: MapStyleElement[] = [
  {elementType: 'geometry', stylers: [{color: '#1e293b'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#94a3b8'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#0f172a'}]},
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#334155'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#0f172a'}],
  },
];

