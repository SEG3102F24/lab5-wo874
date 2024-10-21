import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Employee } from "../model/employee";
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  
  employees$: BehaviorSubject<readonly Employee[]>=new BehaviorSubject<readonly Employee[]>([]);

  constructor(private firestore: Firestore) {
    this.getEmployeesFromFirestore(); // Fetch employees when service is initialized
  }

  get $(): Observable < readonly Employee[]> {
    return this.employees$;
  }
  async addEmployee(employee: Employee) {
    try {
      
      const employeeCollection=collection(this.firestore, 'employees');
      await addDoc(employeeCollection,{ ...employee }); 
      this.employees$.next([...this.employees$.getValue(), employee]); 
      return true;
    } catch (error){
      
      console.error("Error adding employee to Firestore: ", error);
      return false;
      
    }
  }
  getEmployeesFromFirestore(){
    const employeeCollection = collection(this.firestore, 'employees');
    collectionData(employeeCollection, { idField: 'id' })
      .pipe(
        map((data) => {
          return data.map((emp) =>({
            ...emp,
            dateOfBirth: emp['dateOfBirth'].toDate ? emp['dateOfBirth'].toDate() : new Date(emp['dateOfBirth'])
          })) as Employee[];
          
        })
      )
      .subscribe((employees: Employee[]) =>{
        this.employees$.next(employees); 
        
      });
  }
  
}
