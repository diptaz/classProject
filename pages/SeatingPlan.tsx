import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role, User } from '../types';
import { RefreshCw, XCircle, UserPlus, UserMinus } from 'lucide-react';

export const SeatingPlan = () => {
  const { users, currentUser, randomizeSeats, resetSeats, updateSeat } = useStore();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  
  const canManage = [Role.KURIKULUM, Role.ADMIN].includes(currentUser?.role as Role);

  // Generate grid 5 rows x 7 cols = 35 seats
  const seats = Array.from({ length: 35 }, (_, i) => i);

  // Map seat index to user
  const getStudentAtSeat = (index: number) => {
    return users.find(u => u.role === Role.STUDENT && u.seatIndex === index);
  };

  // Get students who don't have a seat
  const unseatedStudents = users.filter(u => u.role === Role.STUDENT && (u.seatIndex === null || u.seatIndex === undefined));

  const handleSeatClick = (index: number) => {
    if (!canManage) return;
    setSelectedSeat(index);
  };

  const assignUser = (userId: string) => {
    if (selectedSeat !== null) {
      updateSeat(userId, selectedSeat);
      setSelectedSeat(null);
    }
  };

  const removeUser = () => {
    if (selectedSeat !== null) {
       const student = getStudentAtSeat(selectedSeat);
       if (student) {
         updateSeat(student.id, null);
       }
       setSelectedSeat(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seating Plan</h1>
        {canManage && (
          <div className="flex gap-3">
             <button 
              onClick={resetSeats}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition"
            >
              <XCircle size={18} /> Reset
            </button>
            <button 
              onClick={randomizeSeats}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-blue-600 rounded-lg transition"
            >
              <RefreshCw size={18} /> Randomize
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-200 dark:bg-gray-800 p-4 mb-6 rounded text-center font-bold text-gray-500 dark:text-gray-400 tracking-widest">
        WHITEBOARD / TEACHER AREA
      </div>

      <div className="grid grid-cols-7 gap-4 mx-auto max-w-6xl">
        {seats.map((seatIdx) => {
          const student = getStudentAtSeat(seatIdx);
          return (
            <div 
              key={seatIdx}
              onClick={() => handleSeatClick(seatIdx)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center p-2 shadow-sm border relative
                transition-all duration-300
                ${student 
                  ? 'bg-white dark:bg-gray-700 border-green-200 dark:border-green-900' 
                  : 'bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600 text-gray-400'}
                ${canManage ? 'cursor-pointer hover:border-primary hover:shadow-md' : 'cursor-default'}
              `}
            >
              <span className="text-xs text-gray-300 absolute top-1 right-2">{seatIdx + 1}</span>
              {student ? (
                <>
                   <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mb-2">
                     {student.username.substring(0,2).toUpperCase()}
                   </div>
                   <p className="text-xs font-medium text-center truncate w-full dark:text-gray-200">
                     {student.fullName}
                   </p>
                </>
              ) : (
                <span className="text-xs">Empty</span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        Layout: 7 Columns x 5 Rows (35 Seats). {canManage ? 'Click a seat to assign.' : ''}
      </div>

      {/* Manual Assignment Modal */}
      {selectedSeat !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Seat #{selectedSeat + 1}</h3>
            
            {getStudentAtSeat(selectedSeat) ? (
              <div className="text-center">
                 <p className="mb-4 text-gray-600 dark:text-gray-300">
                   Occupied by <strong>{getStudentAtSeat(selectedSeat)?.fullName}</strong>
                 </p>
                 <button onClick={removeUser} className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 flex items-center justify-center gap-2">
                    <UserMinus size={18} /> Vacate Seat
                 </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <p className="text-sm text-gray-500">Select a student to place here:</p>
                 <div className="max-h-60 overflow-y-auto space-y-1">
                   {unseatedStudents.length === 0 ? (
                     <p className="text-sm text-gray-400 italic">All students are seated.</p>
                   ) : unseatedStudents.map(u => (
                     <button 
                       key={u.id}
                       onClick={() => assignUser(u.id)}
                       className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                     >
                       {u.fullName}
                     </button>
                   ))}
                 </div>
              </div>
            )}
             <button onClick={() => setSelectedSeat(null)} className="mt-4 w-full border py-2 rounded text-gray-500 dark:text-gray-400 dark:border-gray-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
