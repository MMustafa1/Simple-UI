import React, { useState, useEffect, useCallback } from 'react';

const generateTimeOptions = () => {
  const options = [];
  for (let hours = 0; hours <= 8; hours++) 
    {
    for (let minutes = 0; minutes < 60; minutes += 15) 
      {
        if (hours === 8 && minutes > 0) 
        {
          break;
        } 
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      options.push(timeString);
    }
  }
  return options;
};

const generateDistanceOptions = () => {
  const options = [];
  for (let i = 1; i <= 30; i++) 
  {
     options.push(i.toString());
  }
  return options;
};

const getRateForCase = (caseValue) => {
  switch (caseValue) 
  {
    case 'LA2025001 - Drozdz':
      return 250;
    case 'Case 2':
      return 150;
    default:
      return 0; 
  }
};

const calculateBillingAmount = (rate, quantity, type) => {
  if (type === 'distance') 
  {
    const distanceValue = parseInt(quantity, 10);
    return isNaN(distanceValue) ? 0 : rate * distanceValue;
  } 
  else 
  {
    const parts = quantity.split(':').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) 
    {
      const hours = parts[0];
      const minutes = parts[1];
      const seconds = parts[2];
      const totalHours = hours + minutes / 60 + seconds / 3600;
      return rate * totalHours;
    }
    return 0; 
  }
};

const BillingItemRow = ({ itemData, onBillingItemChange, onBillingItemDelete, billingItemIndex, parentCase }) => {
  const { type, rate, quantity, status, amount } = itemData;
  const timeOptions = generateTimeOptions();
  const distanceOptions = generateDistanceOptions();

  const handleInputChange = (e) => 
  {
    const { name, value, type: inputType, checked } = e.target;
    const newValue = inputType === 'checkbox' ? checked : value;
    onBillingItemChange(billingItemIndex, name, newValue);
  };

  useEffect(() => {
    const newRate = getRateForCase(parentCase);
    if (newRate !== itemData.rate || (itemData.rate === 0 && parentCase)) 
    {
      onBillingItemChange(billingItemIndex, 'rate', newRate);
    }
  }, [parentCase, billingItemIndex, itemData.rate, onBillingItemChange]);

  useEffect(() => {
    const newAmount = calculateBillingAmount(itemData.rate, itemData.quantity, itemData.type);
    {
      onBillingItemChange(billingItemIndex, 'amount', newAmount);
    }
  }, [itemData.rate, itemData.quantity, itemData.type, itemData.amount, billingItemIndex, onBillingItemChange]);

  useEffect(() => {
    if (type === 'distance' && quantity.includes(':')) 
    {
      onBillingItemChange(billingItemIndex, 'quantity', '1');
    } 
    else if (type !== 'distance' && !quantity.includes(':')) 
    {
      onBillingItemChange(billingItemIndex, 'quantity', '00:00:00');
    }
  }, [type, quantity, billingItemIndex, onBillingItemChange]);

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 0.8fr 0.8fr 0.8fr 1fr 40px ',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px dotted #ddd',
    alignItems: 'center',
    fontSize: '0.9em',
    color: '#000',
  };

  const inputStyle = {
    padding: '6px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    width: 'calc(100% - 12px)',
    backgroundColor: '#fff',
    color: '#000',
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#000',
  };

  const checkboxStyle = {
    transform: 'scale(1.2)',
  };

  const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px',
  };

  return (
    <div style={rowStyle}>
      <select name="type" value={type} onChange={handleInputChange} style={inputStyle}>
        <option value="working time">working time</option>
        <option value="travel time">travel time</option>
        <option value="distance">distance</option>
      </select>
      <input type="number" name="rate" value={rate} onChange={handleInputChange} style={inputStyle} readOnly />
      {type === 'distance' ? (
        <select name="quantity" value={quantity} onChange={handleInputChange} style={inputStyle}>
          {distanceOptions.map((distanceOption) => (
            <option key={distanceOption} value={distanceOption}>
              {distanceOption}
            </option>
          ))}
        </select>
      ) : (
        <select name="quantity" value={quantity} onChange={handleInputChange} style={inputStyle}>
          {timeOptions.map((timeOption) => (
            <option key={timeOption} value={timeOption}>
              {timeOption}
            </option>
          ))}
        </select>
      )}
      <div style={checkboxContainerStyle}>
        <input type="checkbox" name="status" checked={status} onChange={handleInputChange} style={checkboxStyle} />
        <span>Billable</span>
      </div>
      <div style={{ ...inputStyle, border: '1px solid #ccc', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        € {amount.toFixed(2)}
      </div>
      <button style={deleteButtonStyle} onClick={() => onBillingItemDelete(billingItemIndex)}>
        🗑️
      </button>
    </div>
  );
};

const TimesheetRow = ({ rowData, onRowChange, onRowDelete, rowIndex }) => {
  const { type, date, case: caseType, description, showBillingSection, billingItems } = rowData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onRowChange(rowIndex, name, value);
  };

  useEffect(() => {
    const shouldShowBilling = type !== '';
    
    if (shouldShowBilling && !showBillingSection) 
    {
      onRowChange(rowIndex, 'showBillingSection', true);
      
      if (billingItems.length === 0) 
      {
        const defaultBillingItem = {
          id: Date.now() + Math.random(),
          type: 'working time',
          rate: getRateForCase(caseType),
          quantity: '00:00:00',
          status: true,
          amount: 0,
        };
        onRowChange(rowIndex, 'billingItems', [defaultBillingItem]);
      }
    } 
    else if (!shouldShowBilling && showBillingSection) 
    {
      onRowChange(rowIndex, 'showBillingSection', false);
    }
  }, [type, showBillingSection, billingItems.length, caseType, onRowChange, rowIndex]);

  const addBillingItem = () => {
    const newBillingItems = [
      ...billingItems,
      {
        id: Date.now() + Math.random(),
        type: 'working time',
        rate: getRateForCase(caseType),
        quantity: '00:00:00',
        status: true,
        amount: 0,
      },
    ];
    onRowChange(rowIndex, 'billingItems', newBillingItems);
  };

  const handleBillingItemChange = useCallback((billingItemIndex, name, value) => {
    const updatedBillingItems = billingItems.map((item, index) => {
      if (index === billingItemIndex) 
      {
        return { ...item, [name]: value };
      }
      return item;
    });
    onRowChange(rowIndex, 'billingItems', updatedBillingItems);
  }, [billingItems, onRowChange, rowIndex]);

  const handleBillingItemDelete = useCallback((billingItemIndex) => {
    const updatedBillingItems = billingItems.filter((_, index) => index !== billingItemIndex);
    onRowChange(rowIndex, 'billingItems', updatedBillingItems);
  }, [billingItems, onRowChange, rowIndex]);

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 2fr 40px',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
    alignItems: 'center',
    color: '#000',
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    fontSize: '0.8em',
    color: '#333',
    marginBottom: '5px',
  };

  const inputStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: 'calc(100% - 16px)',
    backgroundColor: '#fff',
    color: '#000',
  };

  const descriptionInputStyle = {
    ...inputStyle,
    width: '100%',
  };

  const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px',
  };

  const billingSectionContainerStyle = {
    gridColumn: '1 / -1',
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
  };

  const billingHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 0.8fr 0.8fr 0.8fr 1fr 40px',
    gap: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #ccc',
    fontWeight: 'bold',
    fontSize: '0.9em',
    color: '#000',
  };

  const addBillingItemButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '1em',
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  return (
    <>
    
      <div style={rowStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Type*</label>
          <select name="type" value={type} onChange={handleInputChange} style={inputStyle}>
            <option value="">Select Type</option>
            <option value="COAI_CORRESPONDENTE">COAI - Correspondente aanvan arbei...</option>
            <option value="PROJECT_WORK">Project Work</option>
            <option value="HOLIDAY">Holiday</option>
          </select>
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Date*</label>
          <input type="date" name="date" value={date} onChange={handleInputChange} style={inputStyle} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Case*</label>
          <select name="case" value={caseType} onChange={handleInputChange} style={inputStyle}>
            <option value="">Select Case</option>
            <option value="LA2025001 - Drozdz">LA2025001 - Drozdz</option>
            <option value="Case 2">Case 2</option>
            <option value="No Case">No Case</option>
          </select>
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Description</label>
          <input
            type="text"
            name="description"
            value={description}
            onChange={handleInputChange}
            placeholder="Description"
            style={descriptionInputStyle}
          />
        </div>
        <button style={deleteButtonStyle} onClick={() => onRowDelete(rowIndex)}>
          🗑️
        </button>
      </div>

      {showBillingSection && (
        <div style={billingSectionContainerStyle}>
          <div style={billingHeaderStyle}>
            <div>Type</div>
            <div>Rate</div>
            <div>Quantity</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>
          {billingItems.map((item, itemIndex) => (
            <BillingItemRow
              key={item.id}
              itemData={item}
              onBillingItemChange={handleBillingItemChange}
              onBillingItemDelete={handleBillingItemDelete}
              billingItemIndex={itemIndex}
              parentCase={caseType}
            />
          ))}
          <button style={addBillingItemButtonStyle} onClick={addBillingItem}>
            + 
          </button>
        </div>
      )}
    </>
  );
};

const TimesheetForm = () => {
  const [timesheetRows, setTimesheetRows] = useState([
    {
      id: Date.now(),
      type: '',
      date: new Date().toISOString().slice(0, 10),
      case: '',
      description: '',
      showBillingSection: false,
      billingItems: [],
    },
  ]);

  const addTimesheetRow = () => {
    setTimesheetRows([
      ...timesheetRows,
      {
        id: Date.now(),
        type: '',
        date: new Date().toISOString().slice(0, 10),
        case: '',
        description: '',
        showBillingSection: false,
        billingItems: [],
      },
    ]);
  };

  const handleRowChange = (rowIndex, name, value) => {
    const updatedRows = timesheetRows.map((row, index) => {
      if (index === rowIndex) 
      {
        return { ...row, [name]: value };
      }
      return row;
    });
    setTimesheetRows(updatedRows);
  };

  const handleRowDelete = (rowIndex) => {
    const updatedRows = timesheetRows.filter((_, index) => index !== rowIndex);
    setTimesheetRows(updatedRows);
  };

  const totalDurationSeconds = timesheetRows.reduce((acc, row) => {
    return acc + row.billingItems.reduce((itemAcc, item) => {
      if (item.type === 'distance') 
      {
        return itemAcc;
      }
      const parts = item.quantity.split(':').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) 
      {
        return itemAcc + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
      }
      return itemAcc;
    }, 0);
  }, 0);

  const formatDuration = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h: ${m}m: ${s}s`;
  };

  const totalAmount = timesheetRows.reduce((acc, row) => {
    return acc + row.billingItems.reduce((itemAcc, item) => itemAcc + item.amount, 0);
  }, 0);

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '900px',
    margin: '20px auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft:'300px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    width: '100%',
    color: '#000',
  };

  const addTimesheetButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const gridHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 2fr 40px',
    gap: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ccc',
    fontWeight: 'bold',
    width: '100%',
    color: '#000',
  };

  const totalsSectionStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #ccc',
    fontSize: '1.1em',
    fontWeight: 'bold',
    width: '100%',
    color: '#000',
  };

  const totalLabelStyle = {
    textAlign: 'right',
    paddingRight: '10px',
  };

  const totalValueStyle = {
    textAlign: 'left',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Timesheet Entries</h2>
        <button style={addTimesheetButtonStyle} onClick={addTimesheetRow}>
          + Add Timesheet
        </button>
      </div>

      <div style={gridHeaderStyle}>
        <div>Type</div>
        <div>Date</div>
        <div>Case</div>
        <div style={{ gridColumn: 'span 1' }}>Description</div>
        <div></div>
      </div>

      {timesheetRows.map((row, index) => (
        <TimesheetRow
          key={row.id}
          rowData={row}
          onRowChange={handleRowChange}
          onRowDelete={handleRowDelete}
          rowIndex={index}
        />
      ))}

      <div style={totalsSectionStyle}>
        <div style={totalLabelStyle}>Total Duration</div>
        <div style={totalValueStyle}>{formatDuration(totalDurationSeconds)}</div>
        <div style={totalLabelStyle}>Total Amount</div>
        <div style={totalValueStyle}>€ {totalAmount.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default TimesheetForm;