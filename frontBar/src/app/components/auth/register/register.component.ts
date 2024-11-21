import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  public user: User;
  public userList: User[];
  public cliente: Cliente;
  public clientList: Cliente[];
  public fileSelected: any;
  public fileCarSelect: any;
  public previsualizacion: string = "";
  public previsualizacionCar: string = "";





  constructor(
    private UserService: UserService,
    private ClientService: ClienteService,
    private _router: Router


  ) {
    this.user = new User(1, "", "", "","");
    this.cliente = new Cliente(1,1,"","","","","");
    this.userList = [];
    this.clientList = [];


  }

  ngOnInit(): void {
    this.getUsers;

  }

  onSubmit(form: any) {
    if (this.fileSelected) {
      this.UserService.uploadImage(this.fileSelected).subscribe({
        next: (response: any) => {
          if (response.filename) {
            this.registerUser(form);
          } else {
            console.error("Falta el nombre del archivo en la respuesta");
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Falta el nombre del archivo en la respuesta del servidor.'
            });
          }
        },
        error: (error: any) => {
          console.error("Error al subir la imagen", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al subir la imagen del usuario. Por favor, inténtalo de nuevo.'
          });
        }
      });
    } else {
      this.registerUser(form);
    }
  }


  registerUser(form: any) {
    this.UserService.register(this.user).subscribe({
      next: (response: any) => {
        if (response.status == 201) {
          this.getUsers();
          console.log("Usuario registrado exitosamente");
          this.cliente.idUser = this.user.id;
          this.registerCliente(form);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Hubo un problema al registrar el usuario. Por favor, inténtalo de nuevo.'
          });
        }
      },
      error: (error: any) => {
        console.error("Error al registrar el usuario", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.'
        });
      }
    });
  }



  registerCliente(form: any) {
    this.ClientService.store(this.cliente).subscribe({
      next: (response: any) => {
        console.log("Cliente registrado exitosamente");
      },
      error: (error: any) => {
        console.error("Error al registrar el Cliente", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el Cliente. Por favor, inténtalo de nuevo.'
        });
      }
    });
  }


  getUsers() {
    this.UserService.getUsers().subscribe({
      next: (response: any) => {
        console.log(response);
        this.userList = response['data'];
      },
      error: (error: any) => {
        console.error("Error al obtener los Usuarios", error);
      }
    });
  };

  /*getCars() {
    this._carService.getVehiculos().subscribe({
      next: (response: any) => {
        console.log(response);
        this.carList = response['data'];
      },
      error: (error: any) => {
        console.error("Error al obtener los Vehiculos", error);
      }
    });
  };*/


  captureFile(event: any) {
    let file = event.target.files[0];
    this.fileSelected = file;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      this.previsualizacion = e.target.result;
    }
  }

  captureFileCar(event: any) {
    let file = event.target.files[0];
    this.fileCarSelect = file;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      this.previsualizacionCar = e.target.result;
    }
  }

  onSubmitLogin(form: any) {
    this.UserService.login(this.user).subscribe({
      next: (response: any) => {
        if (response.status != 401) {
          sessionStorage.setItem("token", response);
          this.UserService.getIdentityFromAPI().subscribe({
            next: (resp: any) => {
              sessionStorage.setItem("identity", JSON.stringify(resp));
              let identity = JSON.parse(sessionStorage.getItem("identity") ?? "{}");
              if (identity.userType == "Admin" || identity.userType == "Empleado") {
                localStorage.clear();
                this._router.navigate(['dashboard']);
              } else {
                this._router.navigate(['menu']);
              }
            },
            error: (error: Error) => {
              console.log(error);
            }
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
          });

        }
      },
      error: (error: any) => {
        console.error("Error al iniciar sesión", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al iniciar sesión. Por favor, inténtalo de nuevo.'
        });
      }
    })
  }




  IsRegisterOpen: boolean = true;
  IsLoginOpen: boolean = false; ;

}
