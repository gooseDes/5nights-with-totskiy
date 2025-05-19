import { MenuScene } from "./menu_scene.js";
import { TestScene } from "./test_scene.js";
import { CampScene } from "./camp_scene.js";
import Stats from 'stats.js';
import * as utils from './utils.js';

const stats = new Stats();
stats.showPanel(0);
stats.dom.style.position = 'fixed';
stats.dom.style.top = '-200svh';
stats.dom.style.left = '2svh';
stats.dom.style.width = '100px';
stats.dom.style.height = '100px';
stats.dom.style.zIndex = '10000';
stats.dom.style.pointerEvents = 'none';
stats.dom.classList.add('stats-panel');
document.body.appendChild(stats.dom);

var scenes = {};

const menu_scene = new MenuScene();
scenes['menu'] = menu_scene;
setTimeout(() =>{
    menu_scene.start()
}, 0);

const test_scene = new TestScene();
scenes['test'] = test_scene;

const camp_scene = new CampScene();
scenes['camp'] = camp_scene;

window.scenes = scenes;

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
const sceneButton = document.getElementById('scene-button');
const menu = document.getElementById('menu');

playButton.addEventListener('click', handlePlayButton);
playButton.addEventListener('touchstart', handlePlayButton);
sceneButton.addEventListener('click', handleSceneButton);
sceneButton.addEventListener('touchstart', handleSceneButton);

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

function handleSceneButton(e) {
    e.preventDefault();
    let scene = prompt("Enter the scene name to load:");
    if (scene) {
        scene = scene.trim().toLowerCase();
        if (scenes[scene]) {
            menu.style.display = 'none';
            menu_scene.stop();
            scenes[scene].start();
        } else {
            alert("Scene not found!");
        }
    }
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
    if (scenes['camp'].running) {
        camp_scene.update();
        camp_scene.render();
    }
    stats.end();
    requestAnimationFrame(update);
}

update();