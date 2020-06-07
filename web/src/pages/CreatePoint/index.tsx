import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
};

interface IBGEStatesResponse {
  id: number;
  sigla: string;
  nome: string;
};

interface IBGECityResponse {
  id: number;
  nome: string;
};

interface StateCode {
  id: number;
  code: string;
  name: string;
};

interface City {
  id: number;
  name: string;
};

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [states, setStates] = useState<StateCode[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [selectedState, setSelectedState] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    street: '',
    reference: '',
  });

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      console.log(latitude, longitude);

      setInitialPosition([latitude, longitude]);
    });
  },[]);
  
  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);
  
  useEffect(() => {
    axios.get<IBGEStatesResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const stateCodes: StateCode[] = response.data.map(({id, sigla: code, nome: name}) => ({id, code, name}));
      setStates(stateCodes);
    });
  }, []);

  useEffect(() => {
    if(selectedState === '0'){
      return;
    }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`).then(response => {
      const citiesList: City[] = response.data.map(({id, nome: name}) => ({id, name}));
      setCities(citiesList);
    });
  }, [selectedState]);

  useEffect(() => {

  }, [selectedPosition]);

  function handleSelectState(event: ChangeEvent<HTMLSelectElement>) {
    const state = event.target.value;
    setSelectedState(state);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    console.log(city);
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    const mapPosition = event.latlng;
    setSelectedPosition([
      mapPosition.lat,
      mapPosition.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item == id);
    if(alreadySelected >= 0){
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, phone, whatsapp, reference, street } = formData;
    const state = selectedState;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name',name);
    data.append('email',email);
    data.append('whatsapp',whatsapp);
    data.append('phone',phone);
    data.append('latitude',String(latitude));
    data.append('longitude',String(longitude));
    data.append('street',street);
    data.append('reference',reference);
    data.append('city',city);
    data.append('state',state);
    data.append('items',items.join(','));

    console.log(selectedFile);

    if(selectedFile){
      data.append('image',selectedFile);
    }
    

    /*const data = {
      name,
      email,
      whatsapp,
      phone,
      latitude,
      longitude,
      street,
      reference,
      city,
      state,
      items
    };*/


    if(items.length === 0){
      alert('Você precisa selecionar ao menos um tipo de item de coleta.');
      return;
    }

    await api.post('points', data);

    alert('Ponto de coleta criado!');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do<br />ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="phone">Telefone</label>
              <input
                type="text"
                name="phone"
                id="phone"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>        
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map
            center={initialPosition}
            zoom={15}
            onClick={handleMapClick}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="state">Estado</label>
              <select
                name="state"
                id="state"
                value={selectedState}
                onChange={handleSelectState}
              >
                <option value="0">Selecione um estado</option>
                {states.map(state => (
                  <option key={state.id} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="street">Rua</label>
            <input
              type="text"
              name="street"
              id="street"
              onChange={handleInputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="reference">Referência</label>
            <input
              type="text"
              name="reference"
              id="reference"
              onChange={handleInputChange}
            />
          </div>
        </fieldset>        
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit" onSubmit={handleSubmit}>
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default CreatePoint;