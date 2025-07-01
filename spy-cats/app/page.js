"use client";

import 'primereact/resources/themes/saga-blue/theme.css'; // Theme (choose your preferred theme)
import 'primereact/resources/primereact.min.css';         // Core CSS
import 'primeicons/primeicons.css';                      // Icons


import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from "primereact/inputtext";



// interface Cat {
//   id: number;
//   name: string;
//   yearsOfExperience: number;
//   salary: number;
//   breed: string;
// }


export default function Management() {
  const [cats, setCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [visibleCreate, setVisibleCreate] = useState(false);
  const [visibleUpdate, setVisibleUpdate] = useState(false);

  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState(0);

  const columns = [
        {field: 'id', header: 'ID'},
        {field: 'name', header: 'Name'},
        {field: 'years_of_exp', header: 'Experience'},
        {field: 'salary', header: 'Salary'},
        {field: 'breed', header: 'Breed'}
    ];

  const toast = useRef(null);

  const deleteCat = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/cats/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete cat');
      const data = await response.json();
      console.log('Deleted cat:', data);
      return data;
    } catch (error) {
      console.error('Error deleting cat:', error);
      throw error;
    }
  };

  const proceedCreate = () => {
    const newCat = {
      name: name,
      years_of_exp: yearsOfExperience,
      salary: 1,
      breed: 'abys' // Assuming breed is not provided in the form
    };

    // Logic to add the new cat to the backend
    fetch('http://localhost:8000/cats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCat),
    })
    .then(response => response.json())
    .then(data => {
      console.log('New cat added:', data);
      setCats([...cats, data]);
      toast.current.show({ severity: 'success', summary: 'Success', detail: `${data.name} has been added`, life: 3000 });
    })
    .catch(error => {
      console.error('Error adding cat:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to add cat', life: 3000 });
    });

    setVisible(false);
  };

  const confirmDelete = () => {
    const cat = selectedCat;
    confirmDialog({
      message: `Are you sure you want to delete ${cat.name}?`,
      // message: `Are you sure you want to delete this cat?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        // Logic to delete the cat
        console.log(`Deleting cat: ${cat.name}`);
        // Assuming you have a function to delete the cat from the backend
        deleteCat(cat.id);
        setCats(cats.filter(c => c.id !== cat.id));
        toast.current.show({ severity: 'success', summary: 'Deleted', detail: `${cat.name} has been deleted`, life: 3000 });
      },
      reject: () => {
        console.log(cat);
        toast.current.show({ severity: 'warn', summary: 'Cancelled', detail: 'Delete action cancelled', life: 3000 });
      }
    });
  };

  const proceedUpdate = () => {
    const cat = selectedCat;
    const updatedCat = {
      ...cat,
      salary: salary
    };
    console.log(updatedCat)
    // Logic to update the cat's salary in the backend
    fetch(`http://localhost:8000/cats/${cat.id}?new_salary=${salary}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCat),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cat updated:', data);
      setCats(cats.map(c => c.id === cat.id ? data : c));
      setVisibleUpdate(false);
      toast.current.show({ severity: 'success', summary: 'Success', detail: `${data.name}'s salary has been updated`, life: 3000 });
    })

  };
  
  React.useEffect(() => {
    async function fetchCats() {
      try {
        const response = await fetch('http://localhost:8000/cats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch cats');
        const data = await response.json();
        setCats(data);
        console.log('Fetched cats:', data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCats();
  }, []);

  const selectCatRow = (e) => {
    setSelectedCat(e.value);
    console.log("Selected cat:", e.value);
    setSalary(e.value.salary);
  };

  

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-2xl font-bold">Management Page</h1>
      <ul>
        <li className="mb-4">This page is for managing spy cats.</li>
        <li className="mb-4">You can perform the following actions:</li>
        <ul className="list-disc pl-6">
          <li className="mb-2">View a list of all spy cats.</li>
          <li className="mb-2">Add a new spy cat with details like Name and Years of Experience.</li>
          <li className="mb-2">Edit a spy cat's Salary.</li>
          <li className="mb-2">Delete a spy cat from the list.</li>
        </ul>
      </ul>

      <div>
        <h1>Cats list table</h1>
        <DataTable 
          value={cats} 
          showGridlines 
          selectionMode="single" 
          selection={selectedCat}
          onSelectionChange={selectCatRow}
          tableStyle={{ minWidth: '50rem' }}>
          
          {columns.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} />
          ))}
        </DataTable>

      </div>
          <Toast ref={toast} />
            <ConfirmDialog />
      <div className="card flex flex-wrap justify-content-center gap-3">
            <Button onClick={setVisibleCreate} label="Add" icon="pi pi-check" />
            <Button onClick={setVisibleUpdate} label="Update" icon="pi pi-check" />
            <Button onClick={confirmDelete} label="Delete" icon="pi pi-times" iconPos="right"  severity="danger"/>
            
            <Dialog header="Add a cat" visible={visibleCreate} style={{ width: '50vw' }} onHide={() => {if (!visibleCreate) return; setVisibleCreate(false); }}>
                <p className="m-0">
                    Please fill in the details of the new cat you want to add.
                    Name and Years of Experience are required fields.
                </p>
                <div className="card flex flex-wrap gap-3 p-fluid">
                  <div className="flex-auto">
                      <label htmlFor="name" className="font-bold block mb-2">Name</label>
                      <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  <div className="flex-auto">
                      <label htmlFor="yearsOfExperience" className="font-bold block mb-2">Years of Experience</label>
                      <InputNumber inputId="yearsOfExperience" value={yearsOfExperience} onValueChange={(e) => setYearsOfExperience(e.value)} />
                  </div>
                  <Button onClick={proceedCreate} label="Confirm" icon="pi pi-check" />
                </div>
            </Dialog>

            <Dialog header="Update Cat" visible={visibleUpdate} style={{ width: '50vw' }} onHide={() => {if (!visibleUpdate) return; setVisibleUpdate(false); }}>
              <p className="m-0">
                    Please enter the new salary for the selected cat.
                </p>
                <div className="card flex flex-wrap gap-3 p-fluid">
                  <div className="flex-auto">
                      <label htmlFor="salary" className="font-bold block mb-2">Salary</label>
                      <InputNumber inputId="salary" value={salary} onValueChange={(e) => setSalary(e.value)} />
                  </div>
                  <Button onClick={proceedUpdate} label="Confirm" icon="pi pi-check" />
                </div>
            </Dialog>
        </div>
    </div>
  );
}
