import { MenuScene } from "./menu_scene.js";
import { TestScene } from "./test_scene.js";
import Stats from 'stats.js';
import * as utils from './utils.js';

const stats = new Stats();
stats.showPanel(0);
stats.dom.style.position = 'fixed';
stats.dom.style.top = '0px';
stats.dom.style.left = '0px';
stats.dom.style.width = '100px';
stats.dom.style.height = '100px';
stats.dom.style.zIndex = '10000';
stats.dom.style.pointerEvents = 'none';
stats.dom.classList.add('stats-panel');
document.body.appendChild(stats.dom);

var scenes = {};

const menu_scene = new MenuScene();

scenes['menu'] = menu_scene;

menu_scene.start();

const test_scene = new TestScene();

scenes['test'] = test_scene;

document.querySelectorAll('.top-panel-button').forEach((button) => {
    const handleEnter = () => {
        Array.from(button.children).forEach((child) => {
            child.classList.add('fa-bounce');
        });
    };

    const handleLeave = () => {
        Array.from(button.children).forEach((child) => {
            child.classList.remove('fa-bounce');
        });
    };

    button.addEventListener('mouseenter', handleEnter);
    button.addEventListener('mouseleave', handleLeave);

    button.addEventListener('touchstart', handleEnter);
    button.addEventListener('touchend', handleLeave);
});

document.querySelectorAll('.popup-close').forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const popup = button.closest('.popup');
        if (popup) {
            utils.closePopup(popup.id);
        }
    });
});


const playButton = document.getElementById('play-button');
const menu = document.getElementById('menu');

playButton.addEventListener('click', handlePlayButton);
playButton.addEventListener('touchstart', handlePlayButton);

const settings_button = document.getElementById('settings-button');
settings_button.addEventListener('click', (e) => {
    e.preventDefault();
    utils.openPopup('settings-popup');
    const volume_slider = document.getElementById('volume-slider');
    volume_slider.value = utils.global.volume * 100;
    volume_slider.addEventListener('input', (e) => {
        utils.global.volume = e.target.value / 100;
        localStorage.setItem('volume', utils.global.volume);
    });
    const resolution_slider = document.getElementById('resolution-slider');
    resolution_slider.value = utils.global.resolution;
    resolution_slider.addEventListener('input', (e) => {
        utils.global.resolution = e.target.value;
        localStorage.setItem('resolution', utils.global.resolution);
    });
    const physics_slider = document.getElementById('physics-slider');
    physics_slider.value = utils.global.physics;
    physics_slider.addEventListener('input', (e) => {
        utils.global.physics = e.target.value;
        localStorage.setItem('physics', utils.global.physics);
    });
});

const info_button = document.getElementById('info-button');
info_button.addEventListener('click', (e) => {
    e.preventDefault();
    utils.openPopup('info-popup');
});

function handlePlayButton(e) {
    e.preventDefault();
    playButton.classList.add('play-button-anim');
    setTimeout(() => {
        playButton.style.display = 'none';
        menu.style.display = 'none';
        menu_scene.stop();
        
        test_scene.start();
    }, 1000);
}

function update() {
    stats.begin();
    if (scenes['menu'].running) {
        menu_scene.update();
        menu_scene.render();
    }
    if (scenes['test'].running) {
        test_scene.update();
        test_scene.render();
    }
    stats.end();
    requestAnimationFrame(update);
}

update();