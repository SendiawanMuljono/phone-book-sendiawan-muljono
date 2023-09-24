/** @jsxImportSource @emotion/react */
import React, { useState, ChangeEvent, useEffect } from 'react';
import { css } from '@emotion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useApolloClient, useMutation } from '@apollo/client';
import { GetContactList } from '../graphql/queries/get-contact-list';
import { GetPhoneList } from '../graphql/queries/get-phone-list';
import { AddContactWithPhones } from "../graphql/mutations/add-contact-with-phones";
import { Link } from 'react-router-dom';

const containerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
`;

const formContainerStyle = css`
  width: 500px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 6px 0 #BFC9D9;
`;

const arrowStyle = css`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00aa5b;
  cursor: pointer;
`;

const titleStyle = css`
  font-size: 22px;
  font-weight: 600;
  color: #00aa5b;
  margin-bottom: 15px;
`;

const fieldStyle = css`
  margin-bottom: 5px;
`;

const labelStyle = css`
  display: flex;
  font-size: 16px;
  margin-bottom: 7px;
`;

const inputContainerStyle = css`
  display:flex;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  background-color: #FFFFFF;
  border: 1px solid #E5E7E9;
  padding-right: 8px;
  margin-bottom: 3px;
`;

const inputStyle = css`
  width: 100%;
  line-height: 20px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px;
`;

const errorCounterStyle = css`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`;
  
const counterStyle = css`
  color: #31353B;
`;

const errorStyle = css`
  color: #EF144A;
`;

const addMorePhoneNumberStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #97f0aa;
  transition: background-color 0.3s;
  cursor: pointer;

  &:hover {
    background-color: #77ed90;
  }
`;

const addMorePhoneNumberIconStyle = css`
  color: #0bd637;
  width: 25px;
  height: 25px;
`;

const deleteIconStyle = css`
  color: #cf0830;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #910924;
  }
`;

const popUpMessageStyle = css`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2E3137;
  color: #fff;
  padding: 12px 16px;
  borderRadius: 8px;
  zIndex: 99999;
`
const saveButtonStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  height: 48px;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  background-color: #00AA5B;
  line-height: 22px;
  text-decoration: none;
  transition: background-color 0.3s;
  cursor: pointer;

  &:hover {
    background-color: #00994d;
  }
`;

const disabledSaveButtonStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  height: 48px;
  font-weight: 800;
  font-size: 18px;
  color: #AAB4C8;
  background-color: #E4EBF5;
  line-height: 22px;
  text-decoration: none;
  cursor: not-allowed;
`;

function AddContact() {
  const [firstName, setFirstName] = useState('');
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastName, setLastName] = useState('');
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [phoneNumbersTouched, setPhoneNumbersTouched] = useState(Array(phoneNumbers.length).fill(false));
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNumbers: [''],
  });

  const client = useApolloClient();
  const checkContactNameUniqueness = () => {
    return client.query({
      query: GetContactList,
      variables: {
        distinct_on: [],
        limit: null,
        offset: null,
        order_by: [],
        where: { 
          first_name: {
            _eq: `${firstName}`
          },
          last_name: {
            _eq: `${lastName}`
          }
        },
      },
    });
  };
  
  const validateContactName = async () => {
    if (firstNameTouched && !firstName.trim()) {
      setFieldErrors((prevState) => ({
        ...prevState,
        firstName: 'First Name must be filled',
      }));
    } else {
      setFieldErrors((prevState) => ({
        ...prevState,
        firstName: '',
      }));
    }

    if (lastNameTouched && !lastName.trim()) {
      setFieldErrors((prevState) => ({
        ...prevState,
        lastName: 'Last Name must be filled',
      }));
    } else {
      setFieldErrors((prevState) => ({
        ...prevState,
        lastName: '',
      }));
    }

    if (firstNameTouched && lastNameTouched) {
      const result = await checkContactNameUniqueness();
      if (result.data.contact.length > 0) {
        setFieldErrors((prevState) => ({
          ...prevState,
          firstName: 'Contact Name must be unique',
          lastName: 'Contact Name must be unique',
        }));
      }
    }
  };

  const checkPhoneNumberUniqueness = (phoneNumber: string) => {
    return client.query({
      query: GetPhoneList,
      variables: {
        distinct_on: ['contact_id'],
        limit: null,
        offset: null,
        order_by: [],
        where: { 
          number: {
            _eq: `${phoneNumber}`
          }
        },
      }
    });
  };

  const validatePhoneNumbers = async () => {
    const uniquePhoneNumbers = new Set();
    const errors = await Promise.all(
      phoneNumbers.map(async (phoneNumber, index) => {
        if (phoneNumbersTouched[index]) {
          const result = await checkPhoneNumberUniqueness(phoneNumber);
          if (result.data.phone.length > 0 || uniquePhoneNumbers.has(phoneNumber)) {
            return 'Phone Number must be unique';
          } else if (!phoneNumber.trim()) {
            return 'Phone Number must be filled';
          }
  
          uniquePhoneNumbers.add(phoneNumber);
        }
        return '';
      })
    );
  
    setFieldErrors((prevState) => ({
      ...prevState,
      phoneNumbers: errors,
    }));
  };

  useEffect(() => {
    validateContactName();
    validatePhoneNumbers();
  }, [firstName, lastName, phoneNumbers]);

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    setFirstNameTouched(true);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    setLastNameTouched(true);
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers[index] = value;
    setPhoneNumbers(updatedPhoneNumbers);

    const updatedPhoneNumbersTouched = [...phoneNumbersTouched];
    updatedPhoneNumbersTouched[index] = true;
    setPhoneNumbersTouched(updatedPhoneNumbersTouched);
  };

  const addPhoneNumberInput = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const [showDeleteInputMessage, setShowDeleteInputMessage] = useState(false);
  const removePhoneNumberInput = (index: number) => {
    setShowDeleteInputMessage(true);
    setTimeout(() => {
      setShowDeleteInputMessage(false);
    }, 5000);
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers.splice(index, 1);
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const hasErrors = Object.values(fieldErrors).some(value => {
    if (Array.isArray(value)) {
      return value.some(item => item !== '');
    }
    return value !== '';
  });

  const isSaveButtonDisabled = hasErrors || (!firstName || !lastName || phoneNumbers.some(number => !number));

  const [showSuccessAddMessage, setShowSuccessAddMessage] = useState(false);

  const [addContactWithPhones] = useMutation(AddContactWithPhones);
  const handleSaveButtonClick = async () => {
    if(!isSaveButtonDisabled){
      try {
        const variables = {
          first_name: `${firstName}`,
          last_name: `${lastName}`,
          phones: phoneNumbers.map((phoneNumber) => ({ number: phoneNumber }))
        };
    
        const response = await addContactWithPhones({ variables });
    
        if (response.data && response.data.insert_contact) {
          setShowSuccessAddMessage(true);
          resetForm();
          client.resetStore();
          setTimeout(() => {
            setShowSuccessAddMessage(false);
          }, 5000);

          console.log("Contact has been Added");
        } else {
          console.error("Error adding contact:", response.errors);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  const resetForm = () => {
    setFirstName('');
    setFirstNameTouched(false);
    setLastName('');
    setLastNameTouched(false);
    setPhoneNumbers(['']);
    setPhoneNumbersTouched(Array(phoneNumbers.length).fill(false));
    setFieldErrors({
      firstName: '',
      lastName: '',
      phoneNumbers: [''],
    });
  };  

  return (
    <div css={containerStyle}>
      <div css={formContainerStyle}>
        <Link to="/">
          <FontAwesomeIcon
            icon={faArrowLeft}
            css={arrowStyle}
          />
        </Link>
        <div css={titleStyle}>Add Contact</div>
        <div css={fieldStyle}>
          <div css={labelStyle}>First Name</div>
          <div                 
            css={[
              inputContainerStyle,
              fieldErrors.firstName && {
                border: '1px solid #EF144A'
              }
            ]}
          >
            <input
              type="text"
              css={inputStyle}
              value={firstName}
              onChange={handleFirstNameChange}
              maxLength={25}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9 ]/g, '');
              }}
            />
          </div>
          <div css={errorCounterStyle}>
            <div css={errorStyle}>{fieldErrors.firstName}</div>
            <div css={counterStyle}>
              {firstName.length}/25
            </div>
          </div>
        </div>
        <div css={fieldStyle}>
          <div css={labelStyle}>Last Name</div>
          <div                 
            css={[
              inputContainerStyle,
              fieldErrors.lastName && {
                border: '1px solid #EF144A'
              }
            ]}
          >
            <input
              type="text"
              css={inputStyle}
              value={lastName}
              onChange={handleLastNameChange}
              maxLength={25}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9 ]/g, '');
              }}
            />
          </div>
          <div css={errorCounterStyle}>
            <div css={errorStyle}>{fieldErrors.lastName}</div>
            <div css={counterStyle}>
              {lastName.length}/25
            </div>
          </div>
        </div>
        {phoneNumbers.map((phoneNumber, index) => (
          <div css={fieldStyle} key={`phone_index_${index}`}>
            <div css={labelStyle}>Phone Number {index > 0 ? index + 1 : '(main)'}</div>
            <div                 
              css={[
                inputContainerStyle,
                fieldErrors.phoneNumbers[index] && {
                  border: '1px solid #EF144A'
                }
              ]}
            >
              <input
                type="text"
                css={inputStyle}
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e, index)}
                maxLength={15}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                }}
              />
              {index > 0 && (
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  css={deleteIconStyle}
                  onClick={() => removePhoneNumberInput(index)}
                  onMouseDown={(e) => e.preventDefault()}
                />
              )}
            </div>
            <div css={errorCounterStyle}>
              <div css={errorStyle}>{fieldErrors.phoneNumbers[index]}</div>
              <div css={counterStyle}>
                {phoneNumber.length}/15
              </div>
            </div>
            {showDeleteInputMessage && (
              <div css={popUpMessageStyle}>
                A Phone Number field has been deleted
              </div>
            )}
          </div>
        ))}
        <div css={addMorePhoneNumberStyle} onClick={addPhoneNumberInput}>
          <FontAwesomeIcon icon={faCirclePlus} css={addMorePhoneNumberIconStyle} />
        </div>

        <div css={isSaveButtonDisabled ? disabledSaveButtonStyle : saveButtonStyle} onClick={() => handleSaveButtonClick()} onMouseDown={(e) => e.preventDefault()}>
          Save
        </div>
        {showSuccessAddMessage && (
          <div css={popUpMessageStyle}>
            Contact has been added
          </div>
        )}
      </div>
    </div>
  );
}

export default AddContact;