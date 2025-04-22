import { MenuScene } from "./menu_scene.js";
import { TestScene } from "./test_scene.js";
import * as utils from './utils.js';

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
    const graphics_slider = document.getElementById('graphics-slider');
    graphics_slider.value = utils.global.graphics * 100;
    graphics_slider.addEventListener('input', (e) => {
        utils.global.graphics = e.target.value / 100;
        localStorage.setItem('graphics', utils.global.graphics);
    });
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
    requestAnimationFrame(update);
    if (scenes['menu'].running) {
        menu_scene.update();
        menu_scene.render();
    }
    if (scenes['test'].running) {
        test_scene.update();
        test_scene.render();
    }
}

update();