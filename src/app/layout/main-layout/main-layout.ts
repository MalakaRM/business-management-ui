import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Navbar, RouterOutlet, Toast],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
