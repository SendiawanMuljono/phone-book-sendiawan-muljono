/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { GetContactList } from '../graphql/queries/get-contact-list';
import { DeleteContactPhone } from '../graphql/mutations/delete-contact-phone';
import { css } from '@emotion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCaretLeft, faCaretRight, faPlus, faCircleXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const container = css`
  margin: 10px;
`;

const contactBoxStyle = css`
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
`;

const nameStyle = css`
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 5px;
`;

const phoneListStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 25px;
  margin-bottom: 5px;
  color: #6D7588;
`;

const arrowStyle = css`
  background-color: #00aa5b;
  transition: background-color 0.3s;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  cursor: pointer;

  &:hover {
    background-color: #00994d;
  }
`;

const paginationStyle = css`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const pageButtonStyle = css`
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
`;

const activePageButtonStyle = css`
  background-color: #00aa5b;
  color: #fff;
`;

const addButtonStyle = css`
  position: fixed;
  bottom: 20px;
  right: 30px;
  padding: 6px 20px;
  background-color: #fff;
  color: #00aa5b;
  border-radius: 20px;
  box-shadow: 0 2px 6px 0 #BFC9D9;
  display: inline-block;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  z-index: 1000;
  transition: background-color 0.3s, color 0.3s;
  cursor: pointer;

  &:hover {
    background-color: #00994d;
    color: #fff;
  }
`;

const searchContainerStyle = css`
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const searchInputStyle = css`
  border: none;
  flex: 1;
  padding: 8px;
  font-size: 16px;
  outline: none;
`;

const searchIconStyle = css`
  color: #6D7588;
  margin-right: 8px;
`;

const deleteIconStyle = css`
  color: #cf0830;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #910924;
  }
`;

const deleteMessageStyle = css`
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

function ContactList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const { loading, error, data, refetch } = useQuery(GetContactList, {
    variables: {
      distinct_on: [],
      limit: searchInput ? null : pageSize,
      offset: searchInput ? null : (currentPage - 1) * pageSize,
      order_by: { first_name: 'asc', last_name: 'asc' },
      where: { 
        _or: [
          {
            first_name: {
              _ilike: `%${searchInput.split(' ')[0]}%`
            },
            last_name: {
              _ilike: `%${searchInput.split(' ').slice(1)}%`
            }
          },
          {
            phones: {
              number: {
                _ilike: `%${searchInput}%`
              }
            }
          }
        ]
      },
    },
    onCompleted: (data) => {
      setTotalPages(0);
      if (data && data.contact_aggregate && data.contact_aggregate.aggregate && !searchInput) {
        const totalCount = data.contact_aggregate.aggregate.count;
        const calculatedTotalPages = Math.ceil(totalCount / pageSize);
        setTotalPages(calculatedTotalPages);
      }
    },
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInput(inputValue);

    refetch();
  };

  const [phoneIndexes, setPhoneIndexes] = useState<number[]>([]);

  const initializePhoneIndexes = (contacts: any) => {
    setPhoneIndexes(contacts.map(() => 0));
  };

  useEffect(() => {
    if (data && data.contact) {
      initializePhoneIndexes(data.contact);
    }
  }, [data]);

  const handleLeftArrowClick = (contactIndex: number) => {
    setPhoneIndexes((prevIndexes) => {
      const totalPhones = data.contact[contactIndex].phones.length;
      const newIndex = (prevIndexes[contactIndex] - 1 + totalPhones) % totalPhones;

      const newIndexes = [...prevIndexes];
      newIndexes[contactIndex] = newIndex;

      return newIndexes;
    });
  };

  const handleRightArrowClick = (contactIndex: number) => {
    setPhoneIndexes((prevIndexes) => {
      const totalPhones = data.contact[contactIndex].phones.length;
      const newIndex = (prevIndexes[contactIndex] + 1) % totalPhones;

      const newIndexes = [...prevIndexes];
      newIndexes[contactIndex] = newIndex;

      return newIndexes;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const [deleteContactPhone] = useMutation(DeleteContactPhone);

  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  
  const client = useApolloClient();
  const handleContactDeletion = async (contactId: number) => {
    console.log("Deleting contact:", contactId);
    try {
      await deleteContactPhone({
        variables: { id: contactId },
      });

      client.resetStore();

      setShowDeleteMessage(true);
      setTimeout(() => {
        setShowDeleteMessage(false);
      }, 5000);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div css={container}>
      <div css={searchContainerStyle}>
        <FontAwesomeIcon icon={faSearch} css={searchIconStyle} />
        <input
          type="text"
          css={searchInputStyle}
          placeholder="Search in PhoneBook"
          value={searchInput}
          onChange={handleSearchInputChange}
        />
      </div>
      {loading ? (<p>Loading...</p>) : (
        <div>
          {data.contact.map((contact: any, contactIndex: number) => (
            <div key={contact.id} css={contactBoxStyle}>
              <div css={nameStyle}>
                <div></div>
                <div>
                  {contact.first_name} {contact.last_name}
                  {/* tambahin icon favorit nanti disini */}
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    css={deleteIconStyle}
                    onClick={() => handleContactDeletion(contact.id)}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </div>
              </div>
              <div
                css={[
                  phoneListStyle,
                  contact.phones.length === 1 && {
                    justifyContent: 'center',
                  },
                ]}
              >
                {contact.phones.length > 1 && (
                  <div
                    css={arrowStyle}
                    onClick={() => handleLeftArrowClick(contactIndex)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faCaretLeft} />
                  </div>
                )}
                <div>
                  <FontAwesomeIcon icon={faPhone} />&nbsp;
                  {phoneIndexes[contactIndex] === 0 ? contact.phones[phoneIndexes[contactIndex]]?.number + ' (main)' : contact.phones[phoneIndexes[contactIndex]]?.number}
                </div>
                {contact.phones.length > 1 && (
                  <div
                    css={arrowStyle}
                    onClick={() => handleRightArrowClick(contactIndex)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faCaretRight} />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div css={paginationStyle}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                css={[
                  pageButtonStyle,
                  currentPage === index + 1 ? activePageButtonStyle : null,
                ]}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {showDeleteMessage && (
        <div css={deleteMessageStyle}>
          Contact has been deleted
        </div>
      )}

      <Link to="/phone-book-sendiawan-muljono/add" css={addButtonStyle}>
        <FontAwesomeIcon icon={faPlus} /> Add
      </Link>
    </div>
  );
}

export default ContactList;